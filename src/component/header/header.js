import React, { Component } from 'react'
import logo from './Logo.png'
import fuculty from './faculty.png'
import './style.css'

export default class header extends Component {
    render() {
        return (
            <div className='header'>
                <img src={logo} className="App-logo" alt='logo' />
                <div className="flex-column">
                    <div className="flex-1">ระบบจัดตารางสอน</div>
                    <div className="flex-2">แผนกงานวิชาการปริญญาตรี</div>
                </div>
                <img src={fuculty} className="faculty-logo" alt='faculty-logo'/>
            </div>
        )
    }
}
