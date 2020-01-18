import React from 'react';
import NavigationItems from '../NavigationItems/NavigationItems';
import classes from './SideMenu.module.scss';
import Backdrop from '../../UI/Backdrop/Backdrop';
import Utils from '../../../Utils';
import Button from '../../UI/Button/Button';
import Icon from '../../UI/InputComponents/Icon';

//context
import MenuContext from '../../../context/MenuContext';

const sideMenu = (props) => {
  let classList = Utils.getClassNameString([
    classes.SideMenuBack,
    classes.Close
  ]);
  if (props.open) {
    classList = Utils.getClassNameString([classes.SideMenuBack, classes.Open]);
  }

  return (
    <div className={classes.SideMenu}>
      <Backdrop
        className={classes.Backdrop}
        show={props.open}
        onClick={props.closed}
      />
      <div className={classList}>
        <div className={classes.SideMenuHeader}>
          <h2>Menu</h2>
          <Button className='CloseBtn' onClick={props.closed}>
            <Icon iconstyle='fas' code='times' size='sm'></Icon>
          </Button>
        </div>

        <nav>
          <MenuContext.Provider
            value={{
              closeMenu: props.closed
            }}>
            <NavigationItems isAuthenticated={props.isAuth} />
          </MenuContext.Provider>
        </nav>
      </div>
    </div>
  );
};

export default sideMenu;
