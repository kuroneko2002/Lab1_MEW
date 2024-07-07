import React, { Component } from 'react';

export default class Card extends Component {
  render() {
    const { id, image, title, description, click_event } = this.props
    return (
      <div className='cursor-pointer w-1/2 h-max p-5 m-5 flex bg-white rounded-lg shadow-md ct-hover-opacity' key={id} onClick={click_event}>
        {image ? <img src={image} alt="Logo" className='object-fill h-20 w-24 pr-5'/> : null}
        <div className='text-left'>
          <div className='pb-3 text-xl font-bold'>{title}</div>
          <div className='text-base'>{description}</div>
        </div>
      </div>
    )
  }
}
