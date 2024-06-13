import { Text, View, ScrollView, Image } from 'react-native'
import React from 'react'
import Modal from 'react-native-modal';
import HTMLView from 'react-native-htmlview';
import MI from 'react-native-vector-icons/MaterialIcons';

export default function AboutCategoryDetail({ detailview, onDismiss, singleDetail, setDetailView }) {

  // hide space and set image in about description 
  const renderNode = (node, index, siblings, parent, defaultRenderer) => {
    if (node.name === 'img') {
      const width = node.attribs.width || 300;
      const height = node.attribs.height || 300;

      const { src } = node.attribs;

      return (
        <View key={index} style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Image
            source={{ uri: src }}
            style={{ width: Number(width), height: Number(height), resizeMode: 'contain' }}
          />
        </View>
      );
    }

    if (node.name === 'p' && node.children && node.children.length > 0 && node.children[0].type === 'text' && node.children[0].data === '\u00a0') {
      return null;
    }

    if (node.name === 'p') {
      // Remove margin and padding for paragraphs
      return <Text key={index} style={{ margin: 0, padding: 0 ,color:'black'}}>{defaultRenderer(node.children, parent)}</Text>;
    }
  };

  return (
    <Modal isVisible={detailview} onBackdropPress={onDismiss}
      onBackButtonPress={onDismiss}>
      <View style={{ flex: 1, backgroundColor: '#fff', padding: 10 }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
          <Text style={{ fontWeight: '700', color: 'black' }}>{singleDetail && singleDetail[0]?.title}</Text>
          <MI size={25} color={'#222'} name="clear"
            onPress={() => setDetailView(!detailview)}
          ></MI>
        </View>

        <ScrollView>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 10,
            }}>
          </View>
          <View
            style={{
              height: 0.6,
              width: '100%',
              backgroundColor: '#ccc',
              marginVertical: 5,
              alignSelf: 'center',
            }}></View>
          {singleDetail && singleDetail[0] && singleDetail[0].description !== undefined ? (
            singleDetail[0].description !== '' ? (
              <HTMLView value={singleDetail[0].description} renderNode={renderNode} />
            ) : (
              <Text style={{ color:'black'}}>No description available</Text>
            )
          ) : (
            <Text style={{ color:'black'}}>No description available</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  )
}