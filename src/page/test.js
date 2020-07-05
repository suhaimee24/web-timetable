import React, { Component } from 'react'
import './App.css'
import Topheader from '../component/header/header'
import Footer from '../component/footer/footer'
import Sidebar from '../component/sidebar/sidebar'
import Table2 from '../component/editabletable/table'

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Topheader />
        </div>
        <div className="side-bar">
          <Sidebar/>
        </div>
        <main className="main">
          <header className="head-main">
            กลุ่มในสาขาวิชา
          </header>
          <div className="table-show">
            <Table2 />
          </div>
        </main>
        <div className="footer">
          <Footer />
        </div>
      </div>
    )
  }
}
