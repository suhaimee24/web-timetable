import React from 'react';
import logo from './Logo.png';
import fuculty from './faculty.png';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo"/>
        <div className="flex-column">
          <div className="flex-1">แผนกงานวิชาการปริญญาตรี</div>
          <div className="flex-2">คณะวิศวกรรมศาสตร์</div>
        </div>
        <img src={fuculty} className="fuculty-logo"/>
      </header>
      <sidebar className="side-bar">
        <item class ="bottom-sidebar">กลุ่มในสาขาวิชา</item>
        <item class ="bottom-sidebar">วิชาในสาขาวิชา</item>
        <item class ="bottom-sidebar">รายละเอียดวิชา</item>
        <item class ="bottom-sidebar">ตารางสอน</item> 
      </sidebar>
      <main className="main">
      main
      </main>
      <footer className="footer">
      footer
      </footer>
    </div>
  );
}

export default App;
