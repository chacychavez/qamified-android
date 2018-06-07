import React from 'react';
import { StyleSheet,
         View,
         ScrollView,
         RefreshControl } from 'react-native';
import { responsiveHeight,
         responsiveWidth,
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
         Input,
         Item,
         Spinner } from 'native-base';
import { observer } from 'mobx-react';
import { QuestStore,
         UserStore,
         FeedStore,
         UserProfileStore } from '../mobx';
import moment from 'moment';
import images from '../../assets/img/images'
import firebase from 'react-native-firebase'

@observer

export default class Feed extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    FeedStore.initFeed("")
  }

  _onRefresh() {
    FeedStore.initFeed("")
  }

  render() {
    const {state} = this.props.navigation;
    var category = state.params ? state.params.category : "0";

    const status = (isAnswered, isDuplicate, category) => {
      return (<Text note style={styles.status}>{isAnswered ? "Answered" : "Unanswered"}{isDuplicate ? " · Duplicate" : ""} &#183; {category}</Text>);
    };

    var loading = <Spinner color='#66fcf1' />
    var listItems = FeedStore.quests.map((item, index) => {
      return (
        <Card style={styles.questions} key={index}>
          <CardItem style={{backgroundColor: 'transparent'}}>
            <Text
              style={styles.title}>
                {item.title}
            </Text>
          </CardItem>
          <CardItem style={{backgroundColor: 'transparent'}}>
            { status(item.is_answered, item.is_duplicate, item.category) }
          </CardItem>
          <CardItem style={{backgroundColor: 'transparent'}}
          button onPress={() => this.setUser(item.user_id)}>
            <Left>
              <Thumbnail 
                small
                source={images[item.user_avatar]} />
                  <Body>
                    <View>
                      <Text style={styles.full_name} ellipsizeMode="tail" numberOfLines={1}>{ item.full_name }</Text>
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
                onPress={() => this.upvote(item)}
                style={{borderColor: 'transparent'}}>
                <Icon 
                  name="ios-arrow-up" 
                  style={{fontSize: 28, color: this.isUpvoted(item.upvote) ? 'green' : 'gray'}}/>
              </Button>
              <Button
                bordered
                onPress={() => this.downvote(item)}
                style={{borderColor: 'transparent'}}>
                <Icon 
                  name="ios-arrow-down"
                  style={{fontSize: 28, color: this.isDownvoted(item.downvote) ? 'red' : 'gray'}}/>
              </Button>
              <Text style={styles.votes}>{item.votes}</Text>
            </Left>
            <Right>
              <Button
                transparent
                onPress={ () => this.viewQuest(item) }
                iconRight>
                  <Text 
                    uppercase={false}
                    style={styles.readMore}>
                      Read more
                  </Text>
                  <Icon style={{color: "#66fcf1"}}
                  name="ios-arrow-forward" />
              </Button>
            </Right>
          </CardItem>
        </Card>
      );
    }, this);

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={FeedStore.loading}
              onRefresh={this._onRefresh.bind(this)}
            />}
          >
          <Card style={styles.questions}>
            <CardItem style={{backgroundColor: "transparent"}}>
              <Left>
                <Thumbnail
                  small
                  source={images[UserStore.user.avatar]} />
                    <Body>
                      <Button
                        transparent
                        onPress={() => this.props.navigation.navigate('CreateQuest')}>
                          <Text
                            uppercase={false}
                            style={styles.askQuestion}>
                              Ask question...
                          </Text>
                      </Button>
                    </Body>
              </Left>
            </CardItem>
          </Card>
          { FeedStore.loading ? loading : listItems }
        </ScrollView>
      </View>
    );
  }

  isUpvoted = (upvote) => {
    if(!upvote) {
      return false
    } else if(upvote.includes(UserStore.user._id)) {
      return true
    } else {
      return false
    }
  }

  isDownvoted = (downvote) => {
    if(!downvote) {
      return false
    } else if(downvote.includes(UserStore.user._id)) {
      return true
    } else {
      return false
    }
  }

  viewQuest = (quest) => {
    firebase.analytics()
      .logEvent('VIEW_QUEST', {})

    QuestStore.setCurrentQuest(quest, this.props.navigation);
  }

  upvote = (quest) => {
    firebase.analytics()
      .logEvent('UPVOTE_QUEST', {})

    FeedStore.upvoteQuest(quest)
  }

  downvote = (quest) => {
    firebase.analytics()
      .logEvent('DOWNVOTE_QUEST', {})

    FeedStore.downvoteQuest(quest)
  }

  setUser = (user_id) => {
    firebase.analytics()
      .logEvent('VIEW_USER', {})

    UserProfileStore.setUser(user_id, this.props.navigation)
  }
 }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: { 
    flex: 1,
    width: responsiveWidth(100),
    backgroundColor: "#0b0c10",
  },
  questions: {
    backgroundColor: "#1f2833",
    borderColor: 'transparent',
  },
  status: {
    fontFamily: "Proxima Nova Light",
    fontSize: 16,
    color: "#c5c6c7",
  },
  full_name: {
    fontSize: 18,
    fontFamily: "Gotham Bold",
    color: "#e5e6e7",
  },
  username: {
    fontSize: 16,
    fontFamily: "Proxima Nova Light",
    color: "#c5c6c7",
  },
  votes: {
    fontFamily: "Proxima Nova Regular",
    color: "#e5e6e7",
  },
  readMore: {
    color: "#66fcf1",
    fontFamily: "Proxima Nova Regular",
  },
  askQuestion: {
    color: "#66fcf1",
    fontFamily: "Proxima Nova Regular",
  },
  title: {
    fontFamily: 'Gotham Bold',
    fontSize: 26,
    color: "#e5e6e7",
  },
  description: {
    fontSize: 18,
    fontFamily: "Proxima Nova Regular",
    color: "#e5e6e7",
  },
});
