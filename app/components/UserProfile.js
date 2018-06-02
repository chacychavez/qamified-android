import React from 'react';
import { StyleSheet,
         TextInput,
         ScrollView,
         View,
         TouchableHighlight,
         Modal } from 'react-native';
import { responsiveWidth,
         responsiveHeight,
         responsiveFontSize } from 'react-native-responsive-dimensions';
import { Text,
         Left,
         Right,
         Thumbnail,
         Body,
         Card,
         CardItem,
         Button,
         Icon,
         Item,
         Input,
         Spinner } from 'native-base';
import { observer } from 'mobx-react';
import { UserProfileStore,
         QuestStore,
         FeedStore } from '../mobx';
import moment from 'moment';

@observer

export default class UserProfile extends React.Component {
  constructor(props) {

    super(props);
    this.state = {
      avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
    };
  }

  componentDidMount() {
    UserProfileStore.initProfileFeed()
    UserProfileStore.open = true
  }

  componentWillUnmount() {
    UserProfileStore.open = false
  }

  render() {
    const isAnswered = (isAnswered) => {
      return (isAnswered ? <Text note style={styles.status}>Answered</Text> : <Text note style={styles.status}>Unanswered</Text>);
    };

    var loading = <Spinner color='#c5c6c7' />
    var listItems = UserProfileStore.profileFeed.map((item, index) => {
      return (
        <Card style={styles.questions} key={index}>
          <CardItem style={{backgroundColor: 'transparent'}}>
            <Text
              style={styles.title}>
                {item.title}
            </Text>
          </CardItem>
          <CardItem style={{backgroundColor: 'transparent'}}>
            { isAnswered(item.is_answered) }
          </CardItem>
          <CardItem style={{backgroundColor: 'transparent'}}>
            <Left>
              <Thumbnail
                source={{ uri:this.state.avatar_url }} />
                  <Body>
                    <View>
                      <Text style={styles.postFullName} ellipsizeMode="tail" numberOfLines={1}>{ item.full_name }</Text>
                      <Text style={styles.username} note>{ "@" + item.username } &#183; { moment(item.date_created).fromNow() }</Text>
                    </View>
                  </Body>
            </Left>
          </CardItem>
          <CardItem style={{backgroundColor: 'transparent'}}>
            <Text style={styles.description}>{item.description}</Text>
          </CardItem>
          <CardItem style={{backgroundColor: 'transparent'}}>
            <Left>
              <Button
                bordered
                style={{borderColor: 'transparent'}}
                onPress={() => this.upvote(item)}>
                <Icon 
                  name="ios-arrow-up" 
                  style={{fontSize: 28, color: this.isUpvoted(item.upvote) ? 'green' : 'grey'}}/>
              </Button>
              <Button
                bordered
                style={{borderColor: 'transparent'}}
                onPress={() => this.downvote(item)}>
                <Icon 
                  name="ios-arrow-down"
                  style={{fontSize: 28, color: this.isDownvoted(item.downvote) ? 'red' : 'grey'}}/>
              </Button>
              <Text style={styles.votes}>{item.votes}</Text>
            </Left>
            <Right>
              <Button
                transparent
                primary
                onPress={ () => this.viewQuest(item) }
                iconRight>
                  <Text 
                    uppercase={false}
                    style={styles.readMore}>
                      Read more
                  </Text>
                  <Icon style={{color: "#66fcf1"}}name="ios-arrow-forward" />
              </Button>
            </Right>
          </CardItem>
        </Card>
      );
    }, this);

    return (
      <View style={styles.container}>
        <ScrollView behavior="padding" style={styles.scrollView}>
          <Card style={styles.infoContainer}>
            <CardItem style={{backgroundColor: 'transparent'}}>
              <Thumbnail 
                small
                source={{ uri:this.state.avatar_url }} />
            </CardItem>
            <CardItem style={{backgroundColor: 'transparent'}}>
              <Text
                style={styles.fullName}>
                  { UserProfileStore.fullName }
              </Text>
            </CardItem>
            <CardItem style={{backgroundColor: 'transparent'}}>
              <Text
                style={styles.email}>
                  { UserProfileStore.current_user.email } &#183; { UserProfileStore.current_user.email }
              </Text>
            </CardItem>
            <CardItem style={{backgroundColor: 'transparent'}}>
              <Text
                style={styles.stats}>
                  { UserProfileStore.current_user.points } &nbsp;
                  { UserProfileStore.current_user.points > 1 ? "points" : "point" }
              </Text>
              <Text
                style={styles.stats}>
                  &nbsp; &#183;&nbsp;
                  Level &nbsp;
                  { UserProfileStore.current_user.level }
              </Text>
              <Text
                style={styles.stats}>
                  &nbsp; &#183; &nbsp;
                  { UserProfileStore.current_user.rank }
              </Text>
            </CardItem>
            <CardItem style={{backgroundColor: 'transparent'}}>
              { this.renderDescription() }
            </CardItem>
            <CardItem style={{backgroundColor: 'transparent'}}>
              { this.renderButton() }
            </CardItem>
          </Card>
          <View>
            { UserProfileStore.loading ? loading : listItems }
          </View>
        </ScrollView>
      </View>
    );
  };

  isUpvoted = (upvote) => {
    if(!upvote) {
      return false
    } else if(upvote.includes(UserProfileStore.current_user._id)) {
      return true
    } else {
      return false
    }
  }

  isDownvoted = (downvote) => {
    if(!downvote) {
      return false
    } else if(downvote.includes(UserProfileStore.current_user._id)) {
      return true
    } else {
      return false
    }
  }

  renderDescription = () => {
    if(this.state.editing) {
      return(
         <Input
            autoFocus={true}
            style={styles.bio}
            value={this.state.bio}
            multiline={true}
            placeholder="Add description"
            onChangeText={(input) => {this.setState({bio: input})}}/>
      )
    } else {
      return(
        <Text 
          style={styles.bio}>
          { UserProfileStore.current_user.description }
        </Text>
      )
    }
  };

  renderButton = () => {
    if(this.state.editing) {
      return(
        <Button
          transparent
          primary
          onPress={ () => { this.updateBio() } }>
            <Text 
              uppercase={false}
              style={styles.buttonText}>
               Save
            </Text>
        </Button>
      )
    } else {
      return(
        <Button
          transparent
          primary
           onPress={() => {this.setState({editing: true})}}>
            <Text 
              uppercase={false}
              style={styles.buttonText}>
                Edit description
            </Text>
        </Button>
      )
    }
  }

  updateBio = () => {
    ProfileStore.updateBio(this)
  }

  viewQuest = (quest) => {
    QuestStore.setCurrentQuest(quest, this.props.navigation);
  }

  upvote = (quest) => {
    FeedStore.upvoteQuest(quest)
  }

  downvote = (quest) => {
    FeedStore.downvoteQuest(quest)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer : {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "#1f2833",
    justifyContent: 'center',
    borderColor: "transparent",
  },
  scrollView: {
    flex: 1,
    width: responsiveWidth(100),
    backgroundColor: "#0b0c10",
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    elevation: 1,
    marginBottom: 12,
    padding: 20,
    backgroundColor: "white",
  },
  fullName: {
    textAlign: 'center',
    fontSize: 28,
    fontFamily: "Gotham Bold",
    color: "#e5e6e7",
  },
  postFullName: {
    fontSize: 18,
    fontFamily: "Gotham Bold",
    color: "#e5e6e7",
  },
  username: {
    fontSize: 16,
    fontFamily: "Proxima Nova Light",
    color: "#c5c6c7",
  },
  stats: {
    fontSize: 16,
    color: "#222222",
    textAlign: 'center',
    fontFamily: "Proxima Nova Regular",
    color: "#e5e6e7",
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: "Proxima Nova Regular",
    color: "#e5e6e7",
  },
  bio: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: "Proxima Nova Regular",
    color: "#e5e6e7",
  },
  buttonText: {
    color: "#66fcf1",
  },
  title: {
    fontFamily: "Gotham Bold",
    fontSize: 24,
    color: "#e5e6e7",
  },
  status: {
    fontFamily: "Proxima Nova Light",
    fontSize: 16,
    color: "#c5c6c7",
  },
  questions: {
    backgroundColor: "#1f2833",
    borderColor: 'transparent',
  },
  readMore: {
    color: "#66fcf1",
    fontFamily: "Proxima Nova Regular",
  },
  description: {
    fontSize: 18,
    fontFamily: "Proxima Nova Regular",
    color: "#e5e6e7",
  },
  votes: {
    fontFamily: "Proxima Nova Regular",
    color: "#e5e6e7",
  },
  readMore: {
    color: "#66fcf1",
    fontFamily: "Proxima Nova Regular",
  },
});
