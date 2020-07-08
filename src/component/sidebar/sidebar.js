import React, { Component } from 'react'
import { Link } from "react-router-dom";

import './style.css';

export default class sidebar extends Component {
    render() {
        return (
            <div className='side-bar'>
                <div className="bottom-sidebar">
                    <Link to='/'>
                        <div className="color-link">กลุ่มในสาขาวิชา</div>
                    </Link>
                </div>
                <div className="bottom-sidebar">
                    <Link to='/curriculum'>
                        <div class="color-link">แผนการเรียน</div>
                    </Link>
                </div>
                <div className="bottom-sidebar">
                    <Link to='/subject_section'>
                        <div class="color-link">วิชาที่เปิดรับ</div>
                    </Link>
                </div>
                <div className="bottom-sidebar">
                    <Link to='/timetable'>
                        <div class="color-link">ตารางสอน</div>
                    </Link>
                </div>
            </div>
        )
    }
}