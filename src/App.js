import React, { Component } from 'react'
import logo from './Logo.png';
import fuculty from './faculty.png';
import './App.css';
import Table from './table'
import Table2 from './Editabletable'

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" />
          <div className="flex-column">
            <div className="flex-1">แผนกงานวิชาการปริญญาตรี</div>
            <div className="flex-2">คณะวิศวกรรมศาสตร์</div>
          </div>
          <img src={fuculty} className="fuculty-logo" />
        </header>
        <sidebar className="side-bar">
          <item class="bottom-sidebar">กลุ่มในสาขาวิชา</item>
          <item class="bottom-sidebar">วิชาในสาขาวิชา</item>
          <item class="bottom-sidebar">รายละเอียดวิชา</item>
          <item class="bottom-sidebar">ตารางสอน</item>
        </sidebar>
        <main className="main">
          <header className="head-main">
            กลุ่มในสาขาวิชา
          </header>
          <div className="table-show">
            <Table2 id="table"/>
          </div>
        </main>
        <footer className="footer">
          <div> คณะวิศวกรรมศาสตร์ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง </div>
          <div>เลขที่ 1 ซอยฉลองกรุง 1 ถนนฉลองกรุง แขวงลาดกระบัง เขตลาดกระบัง กรุงเทพฯ 10520</div>
          <div style={{margin:'5px'}}>เวลาทำการ 8.30-16.30น. โทร 02-329-8321</div>
          <div>© FACULTY OF ENGINEERING, 2019</div>
        </footer>
      </div>
    )
  }
}
