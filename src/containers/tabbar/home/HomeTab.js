// Library Imports
import { StyleSheet, View, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Marquee from './Marquee';
import { useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import { StackNav } from '../../../navigation/NavigationKeys';
import { useNavigation } from '@react-navigation/native';
// Custom Imports
import { styles } from '../../../themes';
import CarouselCardItem, { SLIDER_WIDTH, ITEM_WIDTH } from '../../../components/CarouselCardItem';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import SmallCardComponent from '../../../components/homeComponent/SmallCardComponent';
import EText from '../../../components/common/EText';
import EHeader from '../../../components/common/EHeader';
import { deviceWidth, moderateScale } from '../../../common/constants';
// import TrackPlayer from 'react-native-track-player';
import api from '../../../api/api';

const HomeTab = () => {
  const colors = useSelector(state => state.theme.theme);
  const [extraData, setExtraData] = useState(true);
  const navigation = useNavigation();
  const [index, setIndex] = React.useState(0);
  const isCarousel = React.useRef(null);
  const MarqueeValue = [
    'This is a long text that will continuously scroll horizontally.',
    'This is a long text that will continuously scroll horizontally.',
    'This is a long text that will continuously scroll horizontally.'
  ];

  const data = [
    {
      imgUrl: require("../../../assets/images/banner.png"),
    },
    {
      imgUrl: require("../../../assets/images/banner1.png"),
    },
    {
      imgUrl: require("../../../assets/images/banner2.png"),
    },
    {
      imgUrl: require("../../../assets/images/banner3.jpg"),
    },
  ];

  const dataScheme = [
    {
      imgUrl: require("../../../assets/images/banner.png"),
    },
    {
      imgUrl: require("../../../assets/images/banner1.png"),
    },
    {
      imgUrl: require("../../../assets/images/banner2.png"),
    },
    {
      imgUrl: require("../../../assets/images/banner3.jpg"),
    },
  ];


  const rates = [
    {
      type: 'gold',
      rate: 6700,
      unit: 'Per gram',
    },
    {
      type: 'silver',
      rate: 90,
      unit: 'Per gram',
    },
  ];
  const goldRate = [
    {
      imgUrl: require("../../../assets/images/banner.png"),
    },
    {
      imgUrl: require("../../../assets/images/banner1.png"),
    },
  ];

  const [menu, setMenu] = useState();
  const [datas, setBanner] = useState([]);
  const [marquee, setMarquee] = useState([]);
  const [userName, setUserName] = useState(null);
  const onPressBack = () => { 
    navigation.navigate(StackNav.SchemeDetail);
  };

  useEffect(() => {
    const getUserCart = async () => {
      try {
        const userData = await AsyncStorage.getItem('USER');
        const user = JSON.parse(userData);
        setUserName(user?.first_name || null);
        api.post('/contact/getContactsById', {
          contact_id: user?.first_name || null,
        }).then(res => {
          const contactCri = res.data.data;
          setUserName(contactCri[0].first_name);
        });
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    getUserCart();

  }, []);

  const getMenus = () => {
    api.get('/section/getSectionMenu').then(res => {
      setMenu(res.data.data);
    }).catch(error => {
      console.log("error", error);
    });
  };

  const getMarquee = () => {
    api.get('/setting/getSettingsForQuizInfoText').then(res => {
      setMarquee(res.data.data);
    }).catch(error => {
      console.log("error", error);
    });
  };

  const getBanner = () => {
    api.get('/content/getBanners').then(res => {
      setBanner(res.data.data);
    }).catch(error => {
      console.log("error", error);
    });
  };

  useEffect(() => {
    setExtraData(!extraData);
  }, [colors]);

  useEffect(() => {
    getMenus();
    getBanner();
    getMarquee();
  }, []);

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

  const renderRateItem = ({ item }) => (
    <View style={[
      localStyles.root,
      { backgroundColor: item.type === 'gold' ? '#f7d000' : '#c0c0c0' }
    ]}>
      <Text style={localStyles.rateDisplay}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)} Rate</Text>
      <Text style={localStyles.rateDisplayVal}>{item.rate} Rs</Text>
      <Text style={localStyles.rateDisplayGram}>{item.unit}</Text>
    </View>
  );

  const marqueeValue = marquee && marquee[0]?.value;

  return (
    <View style={[styles.flexGrow1, { backgroundColor: 'white' }]}>
      <EHeader title="Jewel Pro" />
      <View>
        <Text style={localStyles.UserText}> Welcome {userName}</Text>
      </View>
        
        <ScrollView> 
        <View>       
        {rates.length > 0 && ( 
          <FlashList
            data={rates}
            extraData={extraData}
            renderItem={renderRateItem}
            keyExtractor={(item, index) => index.toString()}
            estimatedItemSize={2}
            numColumns={2}
            contentContainerStyle={localStyles.contentContainerStyle}
          />
        )}

      <View style={{
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 0,
        marginTop:10,
      }}>
        <Carousel
          layout="tinder"
          layoutCardOffset={9}
          ref={isCarousel}
          data={data} // Use datas array for Carousel
          renderItem={({ item }) => (
            <TouchableOpacity>
              <Image
                style={{ width: '99%', height: 200, marginTop: 25, borderRadius: 8, marginLeft: 2 }}
                source={item.imgUrl}
              />
            </TouchableOpacity>
          )}
          sliderWidth={SLIDER_WIDTH}
          itemWidth={ITEM_WIDTH}
          inactiveSlideShift={0}
          useScrollView={true}
          autoplay={true}
          autoplayInterval={6000}
          loop={true}
          onSnapToItem={(index) => setIndex(index)}
        />
        <Pagination
              dotsLength={data.length}
              activeDotIndex={index}
              carouselRef={isCarousel}
              dotStyle={{
                width: 10,
                height: 10,
                borderRadius: 5,
                marginHorizontal: 0,
                backgroundColor: colors.primary
              }}
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
              tappableDots={true}
            />
      </View>

      <View style={localStyles.container}>
      <Text style={localStyles.welcomeText}>
        <Text style={localStyles.heading}>Welcome to Jewel Pro!</Text>
        {'\n\n'}
        <Text>
          Investing in gold has never been easier. With Jewel Pro, you can secure your future with smart and flexible gold investment plans tailored just for you.
        </Text>
        {'\n\n'}
        <Text style={localStyles.subHeading}>Why Jewel Pro?</Text>
        <Text>
          {'\n'}{'\u2022'} Reliable and Secure: Your investments are protected with top-tier security measures.
          {'\n'}{'\u2022'} Flexible Plans: Choose from a variety of plans that suit your needs and financial goals.
          {'\n'}{'\u2022'} Transparent Pricing: Get real-time updates on gold prices and track your investments with ease.
          {'\n'}{'\u2022'} 24/7 Support: Our dedicated support team is here to assist you anytime.
        </Text>
        {'\n\n'}
        <Text style={localStyles.subHeading}>Get Started Today!</Text>
        <Text>
          Create your account, explore our plans, and start investing in gold to build a brighter, more secure future.
        </Text>
        {'\n\n'}
        <Text>Thank you for choosing GoldSaver. Your journey to financial security begins here!</Text>
        {'\n\n'}
        <Text style={localStyles.closing}>Happy Investing!</Text>
      </Text>       
    </View>

      <FlashList
        data={dataScheme}
        extraData={extraData}
        renderItem={renderCategoryItem}
        keyExtractor={(item, index) => index.toString()}
        estimatedItemSize={10}
        numColumns={1}
        contentContainerStyle={localStyles.contentContainerStyle}
      />
      </View>
      </ScrollView>
    </View>
  );
}

export default HomeTab;

const localStyles = StyleSheet.create({
  contentContainerStyle: {
    // ...styles.ph10,
    // ...styles.pb20,
  },
  fancyText: {
    alignSelf: 'center',
  },
  UserText: {
    color: '#52316C',
    marginLeft: 10,
    marginTop: 7,
    marginBottom: -4
  },
  root: {
    ...styles.p10,
    ...styles.flex,
    ...styles.shadowStyle,
    ...styles.justifyCenter,
    width: (deviceWidth - moderateScale(35)) / 2,
    ...styles.mt15,
    borderRadius: moderateScale(5),
    marginLeft:15,
    marginRight:15,
  },
  rootScheme: {
    width: (deviceWidth - moderateScale(35)),
    ...styles.mt15,
    ...styles.flex,
    borderRadius: moderateScale(5),
    marginLeft:20,
    
  },
  rateDisplay: {
    color: 'black',
    fontSize: 18,
    textAlign: 'right',
    fontWeight:'bold'
  },
  rateDisplayVal: {
    color: 'green',
    fontSize: 18,
    textAlign: 'right',
  },
  rateDisplayGram: {
    textAlign: 'right',
  },
  imageStyle: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
  container: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#000',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  closing: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});
