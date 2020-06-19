import React, { Component } from 'react'
import { Table, Input, InputNumber, Popconfirm, Form ,Button} from 'antd';
import './table.css';
import { render } from '@testing-library/react';

const columns = [
    {
      title: 'รหัสสาขา',
      dataIndex: 'curr2_id',
      key: 'curr2_id',
      editable: true,
    },
    {
      title: 'สาขาวิขา',
      dataIndex: 'name',
      key: 'name',
      editable: true,
    },
    {
      title: 'section',
      dataIndex: 'curr2_section',
      key: 'curr2_section',
      editable: true,
    },
    {
        title: 'จำนวนวนักศึกษา',
        dataIndex: 'curr2_section_student_amount',
        key: 'curr2_section_student_amount',
        editable: true,
      },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <Button icon="edit" onClick={() => edit("test")}/>
          <Button icon="delete"/>
        </span>
      ),
    },
  ];
  
  const data = [
    {
      curr2_section: '1',
      name: 'คอมพิวเตอร์',
      curr2_section_student_amount: 40,
      curr2_id: '10',
    },
    
  ];
  

function  edit(key) {
  console.log(key);
}
export default class table extends Component {

    render() {
        return (
            <div>
                <Table columns={columns} dataSource={data} bordered />
            </div>
        )
    }
}
