import React, { Component } from 'react'
import { Link } from "react-router-dom";

import './style.css';

export default class sidebar extends Component {
    render() {
        return (
            <div className='side-bar'>
                <Link to='/'>
                    <div class="bottom-sidebar">กลุ่มในสาขาวิชา</div>
                </Link>
                <Link to='/curriculum'>
                    <div class="bottom-sidebar">แผนการเรียน</div>
                </Link>
                <Link to='/subject_section'>
                    <div class="bottom-sidebar">วิชาที่เปิดรับ</div>
                </Link>
                <Link to='/timetable'>
                    <div class="bottom-sidebar">ตารางสอน</div>
                </Link>
            </div>
        )
    }
}