import React, { Component } from 'react';
import classes from './MultiInput.module.scss';
import InputContext from '../../../context/InputContext';
import Icon from '../InputComponents/Icon';
import PropTypes from 'prop-types';
import Button from '../../UI/Button/Button';
import Input from '../../UI/InputComponents/Input';
import DraggableItem from './DraggableItem';

class MultiInput extends Component {
  static contextType = InputContext;

  constructor(props) {
    super(props);

    this.inputClasses = [classes.InputElement];
  }

  state = {
    draggedElement: null,
  };

  componentDidMount() {}

  componentDidUpdate() {}

  dragStartHandler = function (e, index) {
    console.log('FUNCTION dragStartHandler');
    console.log('e: ', e);
    console.log('e.currentTarget: ', e.currentTarget);
    console.log('e.target:', e.target);
    e.target.style.opacity = 0.3;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
    this.setState({ clickIndex: index });
  };

  dragEnterHandler = function (e, index) {
    console.log('FUNCTION dragEnterHandler');
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    console.log('dragenter:', e.currentTarget);

    //set index if not same as current state
    if (this.state.toIndex !== index) {
      console.log('set index:', index);
      this.setState((prevState) => {
        return { toIndex: index };
      });
    }
  };
  dragOverhandler = function (e, index) {
    e.preventDefault();
    //console.log('FUNCTION dragOverhandler');
  };
  dragLeaveHandler = function (e, index) {
    console.log('FUNCTION dragLeaveHandler');
  };

  dragEndHandler = function (e) {
    console.log('FUNCTION dragEndHandler');
    e.target.style.opacity = '';
    e.target.setAttribute('draggable', 'false');
  };

  //this requires dragOverhandler() to have e.preventDefault() for it to work
  dropHandler = function (e) {
    e.preventDefault();

    this.context.moveiteminarray(
      this.props.name,
      this.state.clickIndex,
      this.state.toIndex
    );
  };

  render() {
    const { addinput, removeinput, changed } = this.context;
    console.log('MultiInput: ', this.props.value);
    return (
      <div className={classes.MultiInput}>
        {this.props.value.map((val, index) => {
          let tempClasses = [...this.inputClasses];
          if (
            this.props.componentconfig.validation.isRequired &&
            !val.valid &&
            (val.touched || (!val.touched && !val.pristine))
          ) {
            tempClasses.push(classes.Invalid);
          }
          return (
            <div
              className={classes.FlexGroupRow}
              key={this.props.name + index}
              onDragStart={(event) => {
                this.dragStartHandler(event, index);
              }}
              onDragEnter={(event) => {
                this.dragEnterHandler(event, index);
              }} //event triggers once
              onDragOver={(event) => {
                this.dragOverhandler(event, index);
              }} //event triggers all the time
              onDragLeave={(event) => {
                this.dragLeaveHandler(event, index);
              }}
              onDrop={(event) => {
                this.dropHandler(event);
              }}
              onDragEnd={(event) => {
                console.log('event.currentTarget:', event.currentTarget);
                event.currentTarget.setAttribute('draggable', false);
                this.dragEndHandler(event, index);
              }}
              onMouseDown={(event) => {
                console.log('mousedown');
                if (event.target.className.includes('DraggableItem')) {
                  console.log('event.target:', event.target);
                  console.log('event.currentTarget:', event.currentTarget);
                  event.currentTarget.setAttribute('draggable', 'true');
                }
              }}
              onMouseUp={(event) => {
                console.log('event.currentTarget: ', event.currentTarget);
                event.currentTarget.setAttribute('draggable', 'false');
              }}>
              {this.props.componentconfig.draggable &&
              this.props.value.length > 1 ? (
                <DraggableItem></DraggableItem>
              ) : null}
              <Input
                style={
                  this.props.componentconfig.draggable &&
                  this.props.value.length > 1
                    ? ['Draggable']
                    : null
                }
                className={classes.tempClasses}
                componentconfig={this.props.componentconfig}
                validation={this.props.validation}
                value={val}
                onChange={(event) =>
                  //pass in the name of the prop, and the index (if array item)
                  changed('array', this.props.name, event.target.value, index)
                }
              />
              {this.props.value.length > 1 ? (
                <Button
                  title='Delete'
                  type='WithBorder'
                  className={classes.RemoveButton}
                  onClick={(event) => {
                    event.preventDefault();
                    removeinput(this.props.name, index);
                  }}>
                  <Icon iconstyle='far' code='trash-alt' size='sm' />
                </Button>
              ) : null}
            </div>
          );
        })}
        <Button
          title='Add'
          type='WithBorder'
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            addinput(this.props.type, this.props.name);
          }}>
          <Icon iconstyle='fas' code='plus' size='sm' />
          <p>Add</p>
        </Button>
      </div>
    );
  }
}

MultiInput.propTypes = {
  className: PropTypes.string,
  value: PropTypes.array,
  validation: PropTypes.object,
  placeholder: PropTypes.string,
  componentconfig: PropTypes.object,
  name: PropTypes.string,
  changed: PropTypes.func,
};

export default MultiInput;
