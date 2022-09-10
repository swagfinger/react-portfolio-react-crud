import React, { Component } from 'react';
import Accordion from '../../components/UI/InputComponents/Accordion';
import List from '../../components/UI/InputComponents/List';
import ListItem from '../../components/UI/InputComponents/ListItem';
import * as align from '../../shared/alignFlex';
import Button from '../../components/UI/Button/Button';
import Icon from '../../components/UI/InputComponents/Icon';
import { connect } from 'react-redux';

import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getStorage} from 'firebase/storage';

//firebase imports
import * as FirebaseHelper from '../../shared/firebaseHelper';
//styling
import buttonStyle from '../../components/UI/Button/Button.module.scss';
import FlexRow from '../../hoc/Layout/FlexRow';
import * as Blob from '../../shared/blob';

class ProfileReadDocuments extends Component {
  constructor(props) {
    super(props);
    this.firebaseConfig = {
      apiKey: 'AIzaSyBcmwi6R0CaeY9l1jfEUo0u71MZsVxldKo',
      authDomain: 'react-crud-1db4b.firebaseapp.com',
      databaseURL: 'https://react-crud-1db4b.firebaseio.com',
      projectId: 'react-crud-1db4b',
      storageBucket: 'react-crud-1db4b.appspot.com',
      messagingSenderId: '44556258250',
      appId: '1:44556258250:web:f756e981ee135db270dd33',
      measurementId: 'G-QJZQEZMV2J',
    };
    try {
      console.log('\t%cinitializing firebase', 'background:white; color:red');
      initializeApp(this.firebaseConfig);
    } catch {
      console.log('\t%calready exists...', 'background:white; color:red');
    }
    this.uploadRef = React.createRef();
  }

  state = {
    firebaseFolders: null,
  };

  async componentDidMount() {
    //get from storage folders
    // Get a reference to the storage service, which is used to create references in your storage bucket
    this.storage = getStorage();
    this.storageRef = this.storage.ref(); // Create a storage reference from our storage service
    let ref = this.storageRef;
    ref = this.storageRef.child(this.props.id);

    // console.log(
    //   `\t%cSETSTATE: {firebaseRootRef:${ref}}`,
    //   'background:yellow; color:red'
    // );
    let res = await ref.child('public').listAll();

    // //folders is an array of objects {folder, files:[]}
    let firebaseFolders = [];
    if (res.prefixes.length) {
      res.prefixes.forEach((folder) => {
        //get content for each folder
        firebaseFolders.push({ folder: folder, files: [] });
      });
      console.log('FOLDERS: ', firebaseFolders);
    }

    await this.setState((prevState) => {
      return {
        firebaseRootRef: ref,
        firebaseFolders: firebaseFolders,
      };
    });
  }

  getFiles = async (folderRef, index) => {
    console.log('getFiles function:', index);
    let res = await folderRef.listAll();

    this.setState((prevState) => {
      let oldFolders = [...prevState.firebaseFolders];
      console.log('BASE: ', oldFolders);

      oldFolders[index].files = res.items.map((file, index) => {
        return (
          <ListItem
            key={'file' + index}
            hovereffect={true}
            align={align.justifyContent('space-between')}
            onClick={async (event) => {
              event.preventDefault();
              event.stopPropagation();
              console.log('VIEW CLICKED: ', file);
              const url = await FirebaseHelper.urlFromRef(file);
              console.log('URL: ', url);
              window.open(url, '_blank');
            }}
            title={file.name}>
            <FlexRow>
              <Icon iconstyle='far' code='file' size='lg' />
              <p>{file.name}</p>
            </FlexRow>
            <FlexRow spacingChildren='left'>
              <Button
                className={buttonStyle.NoStyle}
                onClick={async (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  console.log('VIEW CLICKED: ', file);
                  const url = await FirebaseHelper.urlFromRef(file);
                  window.open(url, '_blank');
                }}
                title='open as external link'>
                <Icon iconstyle='fas' code='external-link-alt' size='sm' />
              </Button>
              {/* downloads assets to drive */}
              <Button
                className={buttonStyle.NoStyle}
                onClick={async (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  console.log('DOWNLOAD CLICKED');
                  const url = await FirebaseHelper.urlFromRef(file);
                  const blob = await Blob.getFileBlob(url);
                  const dl = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  document.body.appendChild(a);
                  a.href = dl;
                  a.download = file.name;
                  a.click();

                  // Cleanup
                  window.URL.revokeObjectURL(a.href);
                  document.body.removeChild(a);
                }}
                title='download file'>
                <Icon iconstyle='fas' code='download' size='sm' />
              </Button>
            </FlexRow>
          </ListItem>
        );
      });
      console.log('OLD FOLDERS: ', oldFolders);

      return {
        firebaseFolders: oldFolders,
      };
    });
  };

  render() {
    return (
      <React.Fragment>
        <Accordion
          allowMultiOpen={true}
          hovereffect={true}
          openOnStartIndex={-1} //zero-index, negative value or invalid index to not open on start,
        >
          {(this.state.firebaseFolders || []).map((item, index) => {
            return (
              <div
                key={'file' + index}
                label={item.folder.name}
                onClick={
                  //console.log('CLICKED: ', folderRef);
                  this.getFiles.bind(this, item.folder, index)
                }>
                <List
                  value={{
                    data: item.files,
                  }}></List>
              </div>
            );
          })}
        </Accordion>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    id: state.profile.urlQuerystringId,
  };
};

export default connect(mapStateToProps, null)(ProfileReadDocuments);
