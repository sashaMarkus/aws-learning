import React from "react";
import "./App.css";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { listTalks as ListTalks } from "./graphql/queries";
import { createTalk as CreateTalk } from "./graphql/mutations";
import { v4 as uuidv4 } from "uuid";
import { withAuthenticator } from "aws-amplify-react";
const CLIENT_ID = uuidv4();

class App extends React.Component {
  state = {
    name: "",
    description: "",
    speakerName: "",
    speakerBio: "",
    talks: [],
  };

  async componentDidMount() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      console.log('user:', user);
      console.log('user info:', user.signInUserSession.idToken.payload);
      const talkData = await API.graphql(graphqlOperation(ListTalks));
      console.log("talkData", talkData);
      this.state({
        talks: talkData.data.listTalks.items
      });
    } catch (error) {
      console.log("error fetching talks...", error);
    }
  }

  createTalk = async () => {
    const { name, description, speakerBio, speakerName } = this.state;
    if (
      name === "" ||
      description === "" ||
      speakerBio === "" ||
      speakerName === ""
    )
      return;

    const talk = {
      name,
      description,
      speakerBio,
      speakerName,
      clientId: CLIENT_ID,
    };
    const talks = [...this.state.talks, talk];
    this.setState({
      talks,
      name: "",
      description: "",
      speakerName: "",
      speakerBio: "",
    });
    try {
      await API.graphql(graphqlOperation(CreateTalk, { input: talk }));
      console.log("item created!");
    } catch (error) {
      console.log("error creatig talk...", error);
    }
  };

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };
  render() {
    return (
      <>
        <input
          name="name"
          onChange={this.onChange}
          value={this.state.name}
          placeholder="name"
        />
        <input
          name="description"
          onChange={this.onChange}
          value={this.state.description}
          placeholder="description"
        />
        <input
          name="speakerName"
          onChange={this.onChange}
          value={this.state.speakerName}
          placeholder="speakerName"
        />
        <input
          name="speakerBio"
          onChange={this.onChange}
          value={this.state.speakerBio}
          placeholder="speakerBio"
        />
        <button onClick={this.createTalk}>Create Talk</button>

        {this.state.talks.map((talk, index) => (
          <div key={index}>
            <h3>{talk.speakerName}</h3>
            <h5>{talk.name}</h5>
            <p>{talk.description}</p>
          </div>
        ))}
      </>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
