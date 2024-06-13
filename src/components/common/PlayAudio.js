import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text,Button,TextInput, Slider, TouchableOpacity, View, ScrollView, AppState, ActivityIndicator } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import TrackPlayer, { useProgress, Event } from 'react-native-track-player';
import { moderateScale } from '../../common/constants';
import api from '../../api/api';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";


const areaOptions = [
  { label: 'Photos', value: 'Photos' },
  { label: 'Photos1', value: 'Photos1' },
  { label: 'Option 3', value: 'option3' },
  { label: 'Option 4', value: 'option4' },
  { label: 'Option 5', value: 'option5' },
  { label: 'Option 6', value: 'option6' },
  { label: 'Option 7', value: 'option7' },
  { label: 'Option 8', value: 'option8' },
  // Add other options here
];

const PlayAudio = () => {
  const PAGE_SIZE = 8;
  const [listData, setListData] = useState([])
  const [currentPage, setCurrentPage] = useState(1);

  
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All');
  const [cateOptions, setcateOption] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [valuelistCountry, setValuelistCountry] = useState([]);
  const [isDatePickerVisibleTo, setDatePickerVisibilityTo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [valuelistCity, setValuelistCity] = useState([]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
};

const hideDatePicker = () => {
    setDatePickerVisibility(false);
};
const showDatePickerTo = () => {
    setDatePickerVisibilityTo(true);
};

const hideDatePickerTo = () => {
    setDatePickerVisibilityTo(false);
};

const handleConfirm = (date) => {
  
        setFromDate(date);
   
    hideDatePicker();
};
const handleConfirmTo = (date) => {

   
        setToDate(date);
    
        hideDatePickerTo();
};


  const getMenus = () => {
    api
      .get('/content/getAudioGallery', {
      params: {
        page: currentPage,
        pageSize: PAGE_SIZE,
      },})
      
      .then(res => {
        const serverPath = 'http://43.228.126.245/EMS-API/storage/uploads/';
        const audioData = res.data.data.map(item => ({
          ...item,
          url: serverPath + item.file_name,
        }));
        setListData(audioData);
      })
      .catch(error => {
        console.log("error", error)
      });

  };
  useEffect(() => {
    const countryValue = areaFilter
    console.log('countryValue',countryValue)
            api
            .post('/valuelist/getValueListCity',{value:countryValue})
            .then((res1) => {
              setValuelistCity(res1.data.data);
              console.log('country',res1.data.data)
             })
  }, [areaFilter]);
  const fetchGalleryCatecory = () => {
       
    api.get('/content/getAudioCategory')
        .then((res) => {
            setcateOption(res.data.data);
            
        })
        .catch((error) => {
            console.log('Error fetching data:', error);
          
        });
};

const getValuelistCountry = () => {
  api
    .get('/valuelist/getValueListCountry')
    .then((res) => {
      setValuelistCountry(res.data.data);
    })
    .catch((error) => {
      console.log('valuelist not found:', error);
    });
};
  useEffect(() => {
    getMenus(currentPage);
    fetchGalleryCatecory();
    getValuelistCountry();
  }, [currentPage]);

  const onEndReached = () => {
    const totalItems = listData.length;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);

    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };


  const progress = useProgress();

  const [isPlayingArray, setIsPlayingArray] = useState(Array(listData?.length).fill(false));
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [progressArray, setProgressArray] = useState(Array(listData?.length).fill({ position: 0, duration: 0 }));

  const pauseOnUnmount = async () => {
    // Pause and reset the current track when the component is unmounted
    await TrackPlayer.pause();
    setIsPlayingArray(Array(listData?.length).fill(false));
    setCurrentTrackIndex(null);
  }

  useEffect(() => {
    const unsubscribe = TrackPlayer.addEventListener(Event.PlaybackTrackChanged, (event) => {
      // console.log("Current Track: ", event.nextTrack)
      if (event.nextTrack) {
        const updatedIsPlayingArray = [...isPlayingArray]
        updatedIsPlayingArray[event.nextTrack] = true
        setIsPlayingArray(updatedIsPlayingArray);
        setCurrentTrackIndex(event.nextTrack)
      }
    })
    const subscription = AppState.addEventListener('blur', () => {
      pauseOnUnmount()
    });
    return () => {
      unsubscribe.remove()
      subscription.remove();
    }
  }, [])

  useEffect(() => {
    const setupPlayerAndAddTracks = async () => {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.add(listData);
      const initialState = await TrackPlayer.getState();
    };

    if (listData) {
      setupPlayerAndAddTracks();
    }

    return () => {
      TrackPlayer.pause();
    };
  }, [listData]);

  useEffect(() => {
    return () => pauseOnUnmount()
  }, [])

  const playPause = async (index) => {
    const updatedIsPlayingArray = [...isPlayingArray];
    const isCurrentlyPlaying = currentTrackIndex === index;

    try {
      if (isCurrentlyPlaying && updatedIsPlayingArray[index]) {
        await TrackPlayer.pause();
        updatedIsPlayingArray[index] = false;
      } else {
        if (currentTrackIndex !== null) {
          updatedIsPlayingArray[currentTrackIndex] = false;
          await TrackPlayer.pause();
        }

        await TrackPlayer.skip(index);
        await TrackPlayer.play();

        updatedIsPlayingArray[index] = true;
        setCurrentTrackIndex(index);
        // Check TrackPlayer state after play
        const state = await TrackPlayer.getState();
      }
    } catch (error) {
      console.error('Error playing track:', error);
    }

    setIsPlayingArray(updatedIsPlayingArray);
  };


  useEffect(() => {
    setProgressArray(Array(listData?.length).fill({ position: 0, duration: 0 }));
  }, [listData]);

//  const applyFilters = () => {
//     let filteredData = [...listData];
//     // Apply category filter
//     if (categoryFilter !== 'All') {
     
//         filteredData = filteredData.filter(item => item.category_title === categoryFilter);
       
//       }

//     // Apply date filter
//     if (selectedDate) {
//         const selectedDateString = selectedDate.toISOString().split('T')[0]; // Extract date part
//         console.log('selectedDateString',selectedDateString)
//         filteredData = filteredData.filter(item => {
//             const contentDateString = new Date(item.content_date).toISOString().split('T')[0]; // Extract date part
//             console.log('contentDateString',contentDateString)
//             return contentDateString === selectedDateString;
//         });
//         console.log('filteredData',filteredData)
//     }

//     // Apply area filter
//     if (areaFilter !== 'All') {
//         filteredData = filteredData.filter(item => item.area === areaFilter);
//     }

//     setFilteredGallery(filteredData);
// };
const applyFilters = () => {
  let filteredData = [...listData];
  // console.log('filteredData',filteredData)
  // Apply category filter
  if (categoryFilter !== 'All') {
      filteredData = filteredData.filter(item => item.upload_city === categoryFilter);
  }

  // Apply area filter
  if (areaFilter !== 'All') {
      filteredData = filteredData.filter(item => item.upload_country === areaFilter);
  }

  // Apply date filter if selected
  if (fromDate && toDate) {
      filteredData = filteredData.filter(item => {
          const contentDate = new Date(item.content_date);
          return contentDate >= fromDate && contentDate <= toDate;
      });
  }

 // Apply search filter
 if (searchQuery !== '') {
  filteredData = filteredData.filter(item =>
    (item.search_keyword && item.search_keyword.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );
}


  return filteredData;
};


const filteredGallery = applyFilters();
console.log('title',filteredGallery)
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.filtersContainer}>
                {/* <Picker
                    selectedValue={categoryFilter}
                    onValueChange={(itemValue) => setCategoryFilter(itemValue)}
                    style={{ height: 10, width: 200 }}
                >
                    <Picker.Item label="Category" value="" style={styles.pickerItem} />
                    {cateOptions.map((item) => (
                        <Picker.Item key={item.category_title} label={item.category_title} value={item.category_title} />
                    ))}
                </Picker> */}
                {/* <Picker
                    selectedValue={areaFilter}
                    onValueChange={(itemValue) => setAreaFilter(itemValue)}
                    style={{ height: 10, width: 200}}
                >
                   <Picker.Item label="Country" value="" style={styles.pickerItem}/>
                    {valuelistCountry.map((item) => (
                        <Picker.Item key={item.value} label={item.value} value={item.value} />
                    ))}
                </Picker> */}

                <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={areaFilter}
                    dropdownIconColor="#52316C"
                    onValueChange={(itemValue) => setAreaFilter(itemValue)}
                    style={styles.picker}
                >
                   <Picker.Item label="Country" value="" style={styles.pickerItem}/>
                    {valuelistCountry.map((item) => (
                        <Picker.Item key={item.value} label={item.value} value={item.value} style={styles.pickerItem} />
                    ))}
                </Picker>
                </View>
                <View style={styles.pickerContainer1}>
                <Picker
                    selectedValue={categoryFilter}
                    dropdownIconColor="#52316C"
                    onValueChange={(itemValue) => setCategoryFilter(itemValue)}
                    style={styles.picker}
                >
                   <Picker.Item label="City" value="" style={styles.pickerItem}/>
                    {valuelistCity.map((item) => (
                        <Picker.Item key={item.citi_value} label={item.citi_value} value={item.citi_value} style={styles.pickerItem} />
                    ))}
                </Picker>
                </View>
                {/* <Picker
                    selectedValue={areaFilter}
                    onValueChange={(itemValue) => setAreaFilter(itemValue)}
                    style={{ height: 10, width: 120}}
                >
                    <Picker.Item label="Area" value="" />
                    {valuelistCountry.map((option) => (
                        <Picker.Item key={option.value} label={option.label} value={option.value} />
                    ))}
                </Picker> */}
               

                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                />
                

                <DateTimePickerModal
                isVisible={isDatePickerVisibleTo}
                mode="date"
                onConfirm={handleConfirmTo}
                onCancel={hideDatePickerTo}
                />

                {/* <Button title="Go" color={'red'} onPress={applyFilters}></Button> */}
            </View>
            
         {/*  */}
           <View style={styles.filtersContainerDate}>
          {/* <Button  title="From" onPress={showDatePicker}> </Button> */}
            <TouchableOpacity onPress={showDatePicker} style={[styles.textContainer, { width: '32%' }]}>
                <Text style={styles.textColor}>{fromDate ? fromDate.toDateString() : 'From date'}</Text>
            </TouchableOpacity>
            {/* <Button  title="To" onPress={showDatePickerTo}> </Button> */}
            <TouchableOpacity onPress={showDatePickerTo} style={[styles.textContainer1, { width: '32%' }]}>
                <Text style={styles.textColor}>{toDate ? toDate.toDateString() : 'To date'}</Text>
            </TouchableOpacity>
            </View>
            {toDate !== null || areaFilter !== 'All' ? (
    <TouchableOpacity onPress={() => {setFromDate(null), setToDate(null), setAreaFilter('All'),setCategoryFilter('All')}} style={styles.clearButtonContainer}>
        <Text style={styles.clearButtonText}>Clear</Text>
    </TouchableOpacity>
) : null}
        <TextInput
            style={styles.searchInput}
            color='black'
            placeholder=" Search..."
            placeholderTextColor="black"
            onChangeText={(text) => setSearchQuery(text)}
            value={searchQuery}
         />

      {filteredGallery ? (
        <View style={styles.container}>
          <ScrollView style={{ flex: 1 }}
            onScroll={({ nativeEvent }) => {
              const yOffset = nativeEvent.contentOffset.y;
              const height = nativeEvent.layoutMeasurement.height;
              const contentHeight = nativeEvent.contentSize.height;

              if (yOffset + height >= contentHeight - 20) {
                onEndReached();
              }
            }}
            scrollEventThrottle={400}>
            {filteredGallery.slice(0, currentPage * PAGE_SIZE)?.map((item, index) => (
              <View style={styles.singleContainer} key={index}>
                <View style={styles.cardTopRow}>
                  <View style={styles.halrow}>
                    <View style={{ flexDirection: 'column' }}>
                      <Text style={styles.titleText}>{item?.title}</Text>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <TouchableOpacity onPress={() => playPause(index)}>
                    <AntDesign
                      name={isPlayingArray[index] ? 'pausecircle' : 'play'}
                      size={moderateScale(25)}
                      color={'#000'}
                    />
                  </TouchableOpacity>

                  <View style={styles.sliderView}>
                    {isPlayingArray[index] ? (
                      <Slider
                        value={progress?.position}
                        maximumValue={progress.duration}
                        minimumValue={0}
                        thumbStyle={{ width: 20, height: 20 }}
                        thumbTintColor={'black'}
                        minimumTrackTintColor={'black'}
                        maximumTrackTintColor={'black'}
                        onValueChange={async (value) => {
                          await TrackPlayer.seekTo(value);
                        }}
                      />
                    ) : (
                      <Slider
                        value={progressArray[index]?.position}
                        minimumValue={0}
                        thumbStyle={{ width: 20, height: 20 }}
                        thumbTintColor={'black'}
                        minimumTrackTintColor={'black'}
                        maximumTrackTintColor={'black'}
                        onValueChange={async (value) => await TrackPlayer.seekTo(value)}
                      />
                    )}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <Text style={styles.pageNumberText}>
            Page {currentPage} of {Math.ceil(filteredGallery.length / PAGE_SIZE)}
          </Text>
        </View>
      ) : (
        <ActivityIndicator size="large" color="#000" />
      )}
    </SafeAreaView>
  );
};

export default PlayAudio;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  titleText: {
    color: '#117a4c',
    fontWeight: '700'
  },
  pageNumberText: {
    textAlign:'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#532c6d',
  },
  textStyle: {
    flex: 1,
    padding: 5,
  },
  buttonPlay: {
    fontSize: 16,
    color: 'white',
    backgroundColor: 'rgba(00,80,00,1)',
    borderWidth: 1,
    borderColor: 'rgba(80,80,80,0.5)',
    overflow: 'hidden',
    paddingHorizontal: 15,
    paddingVertical: 7,
  },
  buttonStop: {
    fontSize: 16,
    color: 'white',
    backgroundColor: 'rgba(80,00,00,1)',
    borderWidth: 1,
    borderColor: 'rgba(80,80,80,0.5)',
    overflow: 'hidden',
    paddingHorizontal: 15,
    paddingVertical: 7,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor:'#52316C',
    padding: 6,
    borderRadius: 5,
    marginLeft:10,
    marginRight:10
  
  },
  textContainer1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor:'#52316C',
    padding: 6,
    borderRadius: 5,
    marginRight:130
  },
  feature: {
    flexDirection: 'row',
    padding: 5,
    marginTop: 7,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgb(180,180,180)',
  },
  pickerItem: {
    color: 'black', 
    fontSize:20
},
  singleContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    borderRadius: 10,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    borderRadius: 8,
    paddingLeft: 10,
},
  filtersContainerDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
   alignItems: 'center',
    padding: -1,
},
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  clearButtonText: {
    color: 'red',
    textDecorationLine: 'underline',
},
  halrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderView: {
    alignSelf: 'center',
    width: '90%'
  },
  clearButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    marginLeft:315
},
textColor: {
  color:'white',
  fontSize:13,
 marginLeft:7,
 
  
},
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
},
pickerContainer: {
  borderColor: 'gray',
  borderWidth: 1,
  borderRadius: 3,
  marginVertical: 10,
  marginLeft:7,
  width: 180,
  borderRadius: 8,
  height:40,
  justifyContent: 'center',
},
pickerContainer1: {
  borderColor: 'gray',
  borderWidth: 1,
  borderRadius: 8,
  marginVertical: 10,
  marginRight:10,
  width: 180,
  height:40,
  justifyContent: 'center',
},
picker: {

  borderWidth: 1,
  borderColor: 'gray',
  
},
pickerItem: {
  color: 'black', 
  fontSize:14
},
});