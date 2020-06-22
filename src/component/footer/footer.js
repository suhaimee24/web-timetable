import React, { Component } from 'react'
import './style.css'

export default class footer extends Component {
    render() {
        return (
            <div className ='footercom'>
                <div> คณะวิศวกรรมศาสตร์ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง </div>
                <div>เลขที่ 1 ซอยฉลองกรุง 1 ถนนฉลองกรุง แขวงลาดกระบัง เขตลาดกระบัง กรุงเทพฯ 10520</div>
                <div style={{ margin: '5px' }}>เวลาทำการ 8.30-16.30น. โทร 02-329-8321</div>
                <div>© FACULTY OF ENGINEERING, 2019</div>
            </div>
        )
    }
}
