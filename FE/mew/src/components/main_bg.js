import React, { Component } from 'react'

export default class BG extends Component {
    render() {
        return (
            <div className="absolute top-0 inset-x-0 flex justify-center overflow-hidden bg-[url('assets/bg-home.png')] bg-bottom bg-no-repeat bg-cover h-[710px] -z-30"></div>
        )
    }
}
