import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {useRoute,useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings from '../../../i18n/strings';
import {styles} from '../../../themes';
import {getHeight} from '../../../common/constants';
import EHeader from '../../../components/common/EHeader';
import api from '../../../api/api';
import RadioButton from './RadioButton';
import EText from '../../../components/common/EText';
import HTML from 'react-native-render-html';
import ShowResult from './ShowResult';
import EButton from '../../../components/common/EButton';
import {useSelector} from 'react-redux';
import { StackNav } from '../../../navigation/NavigationKeys';

const stripHtmlTags = htmlString => {
  return htmlString ? (
    <HTML source={{html: htmlString}} contentWidth={200} />
  ) : null;
};

const SchemeDetail = () => {
  const PAGE_SIZE = 5;
  const route = useRoute();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [clients, setClients] = useState([]);
  const [answerDetails, setAnswerDetails] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [user, setUserData] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedQuestionIds, setLoadedQuestionIds] = useState(new Set());
  const colors = useSelector(state => state.theme.theme);

  const onPressBack = () => { 
    navigation.navigate(StackNav.Login);
  };
  const joinForm = () => { 
    navigation.navigate(StackNav.Profile);
  };
  
   const questionIndex = clients.length
   console.log('questionIndex',questionIndex) 
  // console.log('answerResult', answerResult);

  const openModal = url => {
    // setSelectedImageUrl(url);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    // setSelectedImageUrl(null);
  };

  const getUser = async () => {
    let userData = await AsyncStorage.getItem('USER');
    userData = JSON.parse(userData);
    setUserData(userData);
  };

  const contactId = user ? user.contact_id : null;
  const contactName = user ? user.first_name : null;

  useEffect(() => {
    getUser();
  }, [contactId]);

  console.log('contactId', contactId);
  console.log('contactName', contactName);

  const Reset = () => {
    api.post('/content/deleteAnswerReset', {
      contact_id: contactId,
    }).then(res =>{
       if(res && res.data.msg === 'Success'){
        Alert.alert('successfully Reset ')   
      }

    })

  };

  const dataScheme = [
    {
      imgUrl: require("../../../assets/images/banner.png"),
    },
 
  ];


  useEffect(() => {
    api
      .get('/content/getQuestion', {
        params: {
          page: currentPage,
          pageSize: PAGE_SIZE,
        },
      })
      .then(res => {
        const promises = res.data.data.map(element => {
          // Check if the question ID is already loaded
          if (!loadedQuestionIds.has(element.question_id)) {
            loadedQuestionIds.add(element.question_id);
            element.tag = String(element.tag).split(',');
            return api
              .post('/content/getAnswersByQuestionId', {
                question_id: element.question_id,
              })
              .then(res => res.data.data);
          }
          return Promise.resolve(null);
        });

        Promise.all(promises)
          .then(answers => {
            const newClients = res.data.data.filter((_, index) => answers[index]);
            setClients(prevClients => [...prevClients, ...newClients]);
            setAnswerDetails(prevAnswers => [...prevAnswers, ...answers.filter(Boolean)]);
          })
          .catch(error => {
            console.log('Error fetching answers:', error);
          });
      })
      .catch(() => {
        console.log('Error fetching questions');
      });
  }, [currentPage]);

  const loadMoreQuestions = () => {
    // Check if all questions have been loaded
    const totalQuestions = clients.length;
    const totalPossiblePages = Math.ceil(totalQuestions / PAGE_SIZE);

    if (currentPage < totalPossiblePages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };
 

  const handleCheckboxChange = (questionId, answerId, status) => {
    setCheckedItems({
      ...checkedItems,
      [questionId]: answerId,
    });

    api
      .post('/content/getAnswerHistory', {question_id: questionId})
      .then(res => {
        console.log('status', res.data.data);
        if (res.data.data !== undefined) {
          const contactAnswerId = res.data.data.contact_answer_id;
          console.log('contactAnswerId', contactAnswerId);
          api.post('/content/deleteAnswerHistory', {
            contact_answer_id: contactAnswerId,
          });

          const registerData = {
            question_id: questionId,
            answer_id: answerId,
            status: status,
            contact_id: contactId,
            contact_name: contactName,
          };
          console.log('registerData', registerData);
          api
            .post('/content/insertContactAnswer', registerData)
            .then(response => {
              if (response.status === 200) {
                //  Alert.alert('Your answer is successfully registered');
              } else {
                console.error('Error');
              }
            })
            .catch(error => {
              console.error('Error:', error);
            });
        } else {
          const registerData = {
            question_id: questionId,
            answer_id: answerId,
            status: status,
            contact_id: contactId,
            contact_name: contactName,
          };
          console.log('registerData', registerData);
          api
            .post('/content/insertContactAnswer', registerData)
            .then(response => {
              if (response.status === 200) {
                // Alert.alert('You have successfully registered');
              } else {
                console.error('Error');
              }
            })
            .catch(error => {
              console.error('Error:', error);
            });
        }
      });
  };
  console.log('currentPage',currentPage)
  console.log('clients',clients.length)
  console.log('checkedItemslength',checkedItems.length)
  console.log('checkedItems',checkedItems)
  const len = Object.keys(checkedItems).length
  console.log('len',len)

  const renderCategoryItem = ({ item, index }) => (
    <View style={[
      localStyles.rootScheme,
      { backgroundColor: 'white' }
    ]}>
      <TouchableOpacity onPress={onPressBack}>
      <Image
        source={item.imgUrl}
        style={localStyles.imageStyle}
      />
      </TouchableOpacity>
    </View>
  );
  // const renderItem = ({item, index}) => {
  //   const isChecked = checkedItems[item.question_id] || null;
  //   const answers = answerDetails[index] || [];

  //   return (
  //     contactId ? (
  //     <View style={localStyles.container}>
  //       <View style={localStyles.itemContainer}>
  //         <LinearGradient
  //           style={localStyles.item}
  //           colors={['#fff', '#fff']}
  //           start={{x: 0, y: 0.2}}
  //           end={{x: 1.5, y: 0.2}}>
  //           <View style={localStyles.questionRow}>
  //             <Text style={localStyles.indexNum}>{index + 1}.</Text>
  //             <Text style={localStyles.title}>{item.questions}</Text>
  //           </View>

  //           {answers.map(answer => (
              
  //               <RadioButton
  //                 key={answer.answer_id}
  //                 isChecked={isChecked === answer.answer_id}
  //                 label={stripHtmlTags(answer.description)}
  //                 onSelect={() =>
  //                   handleCheckboxChange(
  //                     item.question_id,
  //                     answer.answer_id,
  //                     answer.status,
  //                   )
  //                 }
  //                 textColor='black'
  //               />
            
  //           ))}
  //         </LinearGradient>
  //       </View>
  //     </View>
  //     ):(<Text></Text>)
  //   );
    
  // };
 

  return (
    <>
      <EHeader title="Scheme Detail"   />
      <SafeAreaView style={localStyles.container}>
        <FlatList
        data={dataScheme}

        renderItem={renderCategoryItem}
        keyExtractor={(item, index) => index.toString()}
        estimatedItemSize={10}
        numColumns={1}
        contentContainerStyle={localStyles.contentContainerStyle}
      />              
      </SafeAreaView>
      <View style={localStyles.filtersContainer1}>

  {/* <View style={localStyles.pickerr}>
    <Text style={localStyles.cartItemQuantity7}> My Profile</Text>
  </View> */}
  {/* <View style={localStyles.pickerContainer10}> */}
    <TouchableOpacity
      onPress={() => joinForm()}
      style={[localStyles.flipButton1, styles.backButton1]}>
      <Text style={localStyles.flipButtonText}>Join Now</Text>
    </TouchableOpacity>
  {/* </View> */}
</View>
    </>
  );
};
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  btnContainer: {
    ...styles.mh20,
    ...styles.mb10,
    ...styles.rowSpaceAround,
  },
  pageNumberContainer: {
    ...styles.center,
    marginTop: 10,
  },
  flipButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pageNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#532c6d',
  },
  itemContainer: {
    flex: 1,
    marginVertical: 5,
    marginHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
    shadowOpacity: 0.8,
  },
  signUpContainer: {
    ...styles.rowCenter,
    ...styles.mb20,
  },
  signBtnContainer: {
     ...styles.center,
    width: '85%',
    ...styles.mv20,
    height: getHeight(50),
    borderRadius: 10,
  },
  signBtnContainer1: {
    ...styles.center,
   width: '100%',
   ...styles.mv20,
   height: getHeight(50),
   borderRadius: 10,
 },
 pickerContainer10: {
  // borderColor: 'gray',
  // borderWidth: 1,
  // borderRadius: 8,
  marginVertical: 10,
  marginRight: 25,
  width: 170,
  height: 50,
  justifyContent: 'center',
},

 pickerr: {
  // borderColor: 'gray',
  // borderWidth: 1,
  // borderRadius: 8,
  marginVertical: 10,
  marginLeft: 15,
  width: 170,
  height: 50,
  justifyContent: 'center',
},
flipButton1: {
  backgroundColor: '#f7b800',
  padding: 12,
  borderRadius: 8,
  alignItems: 'center',
  flex: 1,
  marginRight: 5,
},
cartItemQuantity7: {
  fontSize: 30,
  color: 'white',
  marginLeft: 2,
  marginTop: -5,
},
  item: {
    height: 260,
    borderRadius: 8,
    padding: 20,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#532c6d',
    marginBottom: 10,
  },
  title1: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 20,
    color: '#532c6d',
    marginBottom: 10,
    marginTop:10
  },
  title2: {
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 20,
    color: 'red',
    marginBottom: -300,
    marginTop:300
  },
  title3: {
    fontSize: 23,
    fontWeight: 'bold',
    marginLeft: 20,
    color: 'blue',
    marginBottom: -300,
    marginTop:300,
    marginLeft:70
  },
  indexNum: {
    fontWeight: '700',
    color: '#532c6d',
  },
  questionRow: {
    flexDirection: 'row',
  },
  filtersContainer1: {
  
    // borderBottomRightRadius: 5,
    // borderTopLeftRadius: 5,
    backgroundColor: '#f7b800',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 1,
    marginBottom: 5,
    // marginLeft:5,
    // marginRight:5,
  },
  imageStyle: {
    width: '90%',
    height: 200,
    borderRadius: 5,
    marginTop:15,
    marginLeft:20,
  },
});
export default SchemeDetail;
