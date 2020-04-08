import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';

import classes from './Upload.module.scss';

import UploadDrop from './UploadDrop';
import Modal from '../Modal/Modal';
import Input from '../InputComponents/Input';
import List from '../InputComponents/List';
import ListItem from '../InputComponents/ListItem';
import Button from '../Button/Button';
import Icon from '../InputComponents/Icon';
import Checkbox from '../InputComponents/Checkbox';
import Breadcrumb from '../InputComponents/Breadcrumb';

//firebase imports
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

class Upload extends PureComponent {
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
      console.log('initializing firebase');
      firebase.initializeApp(this.firebaseConfig);
    } catch {
      console.log('already exists...');
    }
  }

  state = {
    showModal: false,
    editBreadcrumbModal: false,
    errorModalMessage: null,
    allFolderList: [],
    folders: [], //should store refs of current folder
    files: [], //should store refs of current folder
    checkedFolders: [],
    checkedFiles: [],
    mainChecked: false,
    mainIndeterminate: false,
    currentFolderRef: null,
    tempFolderPath: null, //used for when editing in the modal state
    currentFolderDrilldownRefs: [],
    uploadUrlOver: false,
  };

  componentDidMount() {
    //get from storage folders
    // Get a reference to the storage service, which is used to create references in your storage bucket
    this.storage = firebase.storage();
    this.storageRef = this.storage.ref(); // Create a storage reference from our storage service
    //get id from querystring
    const query = new URLSearchParams(this.props.location.search);
    const id = query.get('id'); //get id in url query params

    let path = this.storageRef;

    if (id) {
      console.log('id: ', id);
      // //current id folder
      path = this.storageRef.child(id);
    } else {
      path = this.storageRef;
    }

    this.changeFolderPath(path);
    this.buildFolderList(path);
  }

  errorConfirmedHandler = () => {
    this.setState({ errorModal: null });
  };

  findFoldersForBuild = (ref) => {
    console.log('FIND FOLDERS FOR BUILD');
    this.setState((prevState) => {
      return { allFolderList: [...prevState.allFolderList, ref] };
    });
    ref.listAll().then((res) => {
      //if the current folder does NOT have folders
      res.prefixes.forEach((folderRef) => {
        this.findFoldersForBuild(folderRef);
      });
    });
  };

  //gets all folders from ref onwards saving refs
  buildFolderList = (ref) => {
    console.log('BUILD FOLDER LIST');
    this.findFoldersForBuild(ref);
  };

  changeFolderPath = (ref) => {
    console.log('CHANGE FOLDER PATH...');
    this.setCurrentFolderRef(ref);

    //go through exisiting references, look for current reference (===) the ref from props,
    let index = this.state.currentFolderDrilldownRefs.findIndex((item) => {
      return item === ref;
    });
    console.log('index:', index);

    //if it is found, then slice off from currentFolderDrilldownRefs onwards...(we navigated back)...
    if (index >= 0) {
      //slice() returns new array..
      this.updateFolderDrilldown(ref);
    }
    //else if not found, then add to currentFolderDrilldownRefs.
    else {
      this.addCurrentFolderToDrilldown(ref);
    }
    this.getFolderData(ref);
  };

  addCurrentFolderToDrilldown = (ref) => {
    console.log('addCurrentFolderToDrilldown: ', ref);
    this.setState((prevState) => {
      return {
        currentFolderDrilldownRefs: [
          ...prevState.currentFolderDrilldownRefs,
          ref,
        ],
      };
    });
  };

  editBreadcrumbModal = () => {
    this.setState((prevState) => {
      return {
        editBreadcrumbModal: true,
        tempFolderPath: prevState.currentFolderRef.location.path, //reset the value when modal is opened
        errorModalMessage: null,
      };
    });
  };

  updateFolderDrilldown = (ref) => {
    let index = this.state.currentFolderDrilldownRefs.findIndex((item) => {
      return item.location.path === ref.location.path; //comparing object paths
    });
    let updatedFolders = this.state.currentFolderDrilldownRefs.slice(
      0,
      index + 1
    );
    this.setState({ currentFolderDrilldownRefs: updatedFolders });
  };

  setCurrentFolderRef = (ref) => {
    this.setState({ currentFolderRef: ref, tempFolderPath: ref.location.path });
  };

  getFolderData = (ref) => {
    // //save to state folder ref from firebase storage
    ref.listAll().then((res) => {
      let folders = [];
      if (res.prefixes.length) {
        res.prefixes.forEach((folderRef) => {
          console.log('folder: ', folderRef.name);
          folders.push(folderRef);
          console.log(
            'XXX folders: ',
            folders.map((item) => {
              return item.name;
            })
          );
        });
      }
      let files = [];
      if (res.items.length) {
        res.items.forEach((itemRef) => {
          // All the items under listRef.
          console.log('file: ', itemRef.name);
          files.push(itemRef);
          console.log(
            'xxx files: ',
            files.map((item) => {
              return item.name;
            })
          );
        });
      }

      this.setState((prevState) => {
        return {
          ...prevState,
          folders: folders,
          files: files,
        };
      });
    });
  };

  uploadHandler = (event) => {
    event.preventDefault();
    console.log('uploadHandler');
  };

  addFolderHandler = (event) => {
    event.preventDefault();
    console.log('addFolderHandler');
    this.setState({ showModal: true });
  };

  uploadUrlOverHandler = (event) => {
    this.setState({ uploadUrlOver: true });
  };
  uploadUrlOutHandler = (event) => {
    this.setState({ uploadUrlOver: false });
  };

  fileCheckHandler = (index, isChecked, event = null) => {
    console.log('onChangeHandler CLICKED: ', index, isChecked);
    this.setState((prevState) => {
      let files = [...prevState.checkedFiles];
      files[index] = isChecked;
      return { checkedFiles: files };
    }, this.checkIndeterminate);
  };

  folderCheckHandler = (index, isChecked, event = null) => {
    console.log('onChangeHandler CLICKED: ', index, isChecked);
    this.setState((prevState) => {
      let folders = [...prevState.checkedFolders];
      folders[index] = isChecked;
      return { checkedFolders: folders };
    }, this.checkIndeterminate);
  };

  toggleCheckAllFolders = (isChecked) => {
    this.setState((prevState) => {
      let folders = [...prevState.folders];
      let result = folders.map((item) => {
        return isChecked;
      });
      console.log('checkAllFolders: ', result);
      return { checkedFolders: result };
    });
  };

  toggleCheckAllFiles = (isChecked) => {
    this.setState((prevState) => {
      let files = [...prevState.files];
      let result = files.map((item) => {
        return isChecked;
      });
      console.log('checkedFiles: ', result);
      return { checkedFiles: result };
    });
  };

  toggleMainChecked = (val) => {
    console.log('toggleMainChecked');

    this.setState((prevState) => {
      return {
        mainChecked: val ? val : !prevState.mainChecked,
        mainIndeterminate: false,
      };
    });
  };

  updateCheck = (index) => {
    console.log('updateCheck: ', index);
  };

  getCheckFoldersLength = () => {
    return this.state.checkedFolders.filter((item) => {
      return item === true;
    }).length;
  };

  getCheckedFilesLength = () => {
    return this.state.checkedFiles.filter((item) => {
      return item === true;
    }).length;
  };

  checkIndeterminate = () => {
    console.log('checkIndeterminate!!!!');

    let checkedItems =
      this.getCheckFoldersLength() + this.getCheckedFilesLength();
    let allItems = this.state.files.length + this.state.folders.length;

    if (checkedItems === allItems) {
      this.setState({ mainIndeterminate: false, mainChecked: true });
    } else if (checkedItems === 0) {
      this.setState({ mainIndeterminate: false, mainChecked: false });
    } else if (checkedItems < allItems) {
      console.log('INDETERMINATE STATE!!');
      this.setState({ mainIndeterminate: true, mainChecked: true });
    }
  };

  render() {
    let currentFolderData = [
      ...this.state.folders.map((item, index) => {
        console.log(`folder [${index}]: ${this.state.checkedFolders[index]}`);
        return (
          <React.Fragment>
            <Checkbox
              onChange={(index, checked) =>
                this.folderCheckHandler(index, checked)
              }
              index={index}
              checked={this.state.checkedFolders[index]}
            ></Checkbox>
            <ListItem
              aligntype="FlexStart"
              hovereffect={true}
              onClick={() => this.changeFolderPath(item)}
            >
              <Icon iconstyle="far" code="folder" size="lg" />
              {item.name}/
            </ListItem>
          </React.Fragment>
        );
      }),
      ...this.state.files.map((item, index) => {
        return (
          <React.Fragment>
            <Checkbox
              onChange={(index, checked) =>
                this.fileCheckHandler(index, checked)
              }
              index={index}
              checked={this.state.checkedFiles[index]}
            ></Checkbox>
            <ListItem
              aligntype="FlexStart"
              hovereffect={true}
              //onClick={() => this.changeFolderPath(item)}
            >
              <Icon iconstyle="far" code="file" size="lg" />
              {item.name}
            </ListItem>
          </React.Fragment>
        );
      }),
    ];
    let isIndeterminateClass =
      this.state.mainIndeterminate === true ||
      (this.getCheckFoldersLength() + this.getCheckedFilesLength() ===
        this.state.files.length + this.state.folders.length &&
        this.state.files.length + this.state.folders.length > 0)
        ? classes.StyleUploadIndeterminate
        : null;

    console.log('IS INDETERMINATE: ', isIndeterminateClass);

    let isHoverUploadUrl =
      this.state.uploadUrlOver === true
        ? classes.UploadUrlOver
        : classes.UploadUrlOut;

    return (
      <div className={classes.Upload}>
        <div className={[classes.Border].join(' ')}>
          <div
            className={[classes.UploadHeader, isIndeterminateClass].join(' ')}
            onMouseOver={this.uploadUrlOverHandler}
            onMouseOut={this.uploadUrlOutHandler}
          >
            {this.state.mainIndeterminate === true ||
            (this.getCheckFoldersLength() + this.getCheckedFilesLength() ===
              this.state.files.length + this.state.folders.length &&
              this.state.files.length + this.state.folders.length > 0) ? (
              <React.Fragment>
                <div className={classes.UploadIndeterminate}>
                  <Button
                    type="CheckboxSize"
                    color="White"
                    onClick={(event) => {
                      event.preventDefault();
                      this.toggleMainChecked(false);
                      this.toggleCheckAllFolders(false);
                      this.toggleCheckAllFiles(false);
                    }}
                  >
                    <Icon iconstyle="fas" code="times" size="lg" />
                  </Button>
                  <span>
                    {this.getCheckFoldersLength() +
                      this.getCheckedFilesLength() +
                      ' selected'}
                  </span>
                </div>
                <Button type="Action">Delete</Button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className={classes.UploadUrl}>
                  <Breadcrumb
                    path={this.state.currentFolderDrilldownRefs}
                    onClick={(ref) => this.changeFolderPath(ref)}
                    onEdit={() => this.editBreadcrumbModal()}
                  ></Breadcrumb>

                  <div
                    className={[classes.Divider, isHoverUploadUrl].join(' ')}
                    title="edit"
                    onClick={() => this.editBreadcrumbModal()}
                  >
                    <Icon iconstyle="fas" code="edit" size="sm" />
                  </div>
                </div>
                <div className={[classes.UploadActionButtons].join(' ')}>
                  <Button
                    type="Action"
                    onClick={this.uploadHandler}
                    title="upload"
                  >
                    <Icon iconstyle="fas" code="arrow-circle-up" size="lg" />
                    Upload file
                  </Button>
                  <Button
                    type="LastItemRight"
                    onClick={this.addFolderHandler}
                    title="new folder"
                  >
                    <Icon iconstyle="fas" code="folder-plus" size="lg" />
                  </Button>
                </div>
              </React.Fragment>
            )}
          </div>

          <React.Fragment>
            <div className={classes.UploadBodyHeader}>
              <div className={classes.HeaderRow}>
                <Checkbox
                  index={0}
                  checked={this.state.mainChecked}
                  indeterminate={this.state.mainIndeterminate}
                  onChange={() => {
                    this.toggleMainChecked();
                    this.toggleCheckAllFolders(!this.state.mainChecked);
                    this.toggleCheckAllFiles(!this.state.mainChecked);
                  }}
                ></Checkbox>
                <span>Name</span>
              </div>
            </div>

            <div className={classes.UploadBody}>
              {this.state.currentFolderDrilldownRefs.length > 1 ? (
                <div
                  className={[
                    classes.FlexGroupRow,
                    classes.NavigateUpOneFolder,
                  ].join(' ')}
                >
                  <ListItem
                    aligntype="FlexStart"
                    hovereffect={true}
                    onClick={() => {
                      //get current index on drilldown,
                      let index = this.state.currentFolderDrilldownRefs.findIndex(
                        (item) => {
                          return (
                            item.location.path ===
                            this.state.currentFolderRef.location.path
                          );
                        }
                      );
                      //navigate to index -1

                      this.changeFolderPath(
                        this.state.currentFolderDrilldownRefs[index - 1]
                      );
                    }}
                  >
                    <Icon
                      iconstyle="fas"
                      code="level-up-alt"
                      size="md"
                      flip="horizontal"
                    />
                    ../
                  </ListItem>
                </div>
              ) : null}

              <List
                value={{
                  data: currentFolderData,
                }}
              ></List>
            </div>
          </React.Fragment>
        </div>

        {/* upload modal for all instances */}
        <Modal
          label="Create folder"
          show={this.state.showModal}
          isInteractive={true}
          modalClosed={() => {
            this.setState({ showModal: false });
          }}
          continue={() => {
            console.log('continue');
            this.addFolderToSelect(this.state.createfoldername);
            this.setState({ showModal: false });
          }}
        >
          <Input
            value={{ data: this.state.createfoldername }}
            placeholder="Folder name"
            onChange={(event) => {
              event.preventDefault();
              console.log('typed: ', event.target.value);
              let targetVal = event.target.value;

              this.setState((prevState) => {
                return {
                  createfoldername: targetVal,
                };
              });
            }}
          />
        </Modal>
        <Modal
          label="Edit folder path"
          show={this.state.editBreadcrumbModal}
          isInteractive={true}
          modalClosed={() => {
            this.setState({
              editBreadcrumbModal: false,
              errorModalMessage: null,
            });
          }}
          continue={() => {
            console.log('continue');
            //go through directory list
            //navigate if folders exists..
            //ie. check all paths in directory list
            try {
              this.state.allFolderList.map((item, index) => {
                console.log(
                  `allFolderList item: index:[${index}]`,
                  item.location.path
                );
                if (item.location.path === this.state.tempFolderPath) {
                  //found in drilldown...so it exists, navigate to it
                  this.changeFolderPath(item);
                  //on continue, navigate to new ref
                  this.setState({
                    editBreadcrumbModal: false,
                    errorModalMessage: null,
                  });
                } else if (
                  this.state.tempFolderPath[
                    this.state.tempFolderPath.length - 1
                  ] === '/'
                ) {
                  console.error('path does not exist');
                  this.setState({
                    errorModalMessage:
                      'Remove trailing "/" character from path',
                  });
                } else {
                  console.error('path does not exist');
                  this.setState({
                    errorModalMessage: 'Path does not exist',
                  });
                }
              });
            } catch {
              //go thru drilldown,
              this.state.currentFolderDrilldownRefs.find((item) => {
                //compare to drilldown ref.location.path, if found, that is the new ref

                if (item.location.path === this.state.tempFolderPath) {
                  //found in drilldown...so it exists, navigate to it
                  this.changeFolderPath(item);
                  //on continue, navigate to new ref
                  this.setState({
                    editBreadcrumbModal: false,
                    errorModalMessage: null,
                  });
                } else if (
                  this.state.tempFolderPath[
                    this.state.tempFolderPath.length - 1
                  ] === '/'
                ) {
                  console.error('path does not exist');
                  this.setState({
                    errorModalMessage:
                      'Remove trailing "/" character from path',
                  });
                } else {
                  console.error('path does not exist');
                  this.setState({
                    errorModalMessage: 'Path does not exist',
                  });
                }
              });
            }
          }}
        >
          <Input
            value={{
              data: this.state.tempFolderPath
                ? this.state.tempFolderPath
                : null,
            }}
            placeholder="Folder"
            onChange={(event) => {
              event.preventDefault();
              console.log('typed: ', event.target.value);
              this.setState({ tempFolderPath: event.target.value });
            }}
          />
          <div className={classes.Errors}>{this.state.errorModalMessage}</div>
        </Modal>
      </div>
    );
  }
}
export default withRouter(Upload);
