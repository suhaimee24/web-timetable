import React, { Component } from 'react'
import { Input, Popconfirm, Button, Spin } from 'antd';
import axios from 'axios'
import './style.css';


const columns = [
  {
    title: 'รหัสสาขา',
    dataIndex: 'curr2_id',
    key: 'curr2_id',
    width: 100
  },
  {
    title: 'สาขาวิขา',
    dataIndex: 'name',
    key: 'name',
    width: 250
  },
  {
    title: 'section',
    dataIndex: 'curr2_section',
    key: 'curr2_section',
    width: 100
  },
  {
    title: 'จำนวนวนักศึกษา',
    dataIndex: 'curr2_section_student_amount',
    key: 'curr2_section_student_amount',
    width: 120
  },
  {
    title: 'Action',
    key: 'action',
    width: 100
  },
];

let curri = [
  {
    curr2_id: '07',
    name: "คอมพิวเตอร์",
  },
  {
    curr2_id: '08',
    name: "วัดคุม",
  },
  {
    curr2_id: '09',
    name: "อิเล็กทรอนิกส์",
  },
  {
    curr2_id: '10',
    name: "โทรคมนาคม",
  },
  {
    curr2_id: '11',
    name: "เคมี",
  },
  {
    curr2_id: '12',
    name: "แมคคาทรอนิกส์",
  },
];
var curri2 = []

const data2 = [];
for (let i = 0; i < 20; i++) {
  data2.push({
    key: i.toString(),
    curr2_section: i.toString(),
    name: 'คอมพิวเตอร์',
    curr2_section_student_amount: 40,
    curr2_id: '10',
  });
}

export default class table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: data2, editingKey: '', count: data2.length, thisAddData: false, curri2: [], resData: [], isLoad: true,
      input: { curr2_id: '', name: '', curr2_section: '', curr2_section_student_amount: 0 },
    }
  }

  componentWillMount() {
    this.getCurriSec()
  }

  async getCurriSec() {
    // fetch("http://localhost:9000/API/curriculum2_section")
    //   .then(res => res.json())
    //   .then(res => {
    //     for (let i = 0; i < res.length; i++) {
    //       this.state.resData.push({
    //         key: i.toString(),
    //         curr2_section: res[i].curr2_section,
    //         name: 'คอมพิวเตอร์',
    //         curr2_section_student_amount: res[i].curr2_section_student_amount,
    //         curr2_id: res[i].curr2_id,
    //       })
    //     }
    //   });

    let currisec = await axios.get("http://localhost:9000/API/curriculum2_section")
    let curri = await axios.get("http://localhost:9000/API/curriculum2")
    // console.log(api.data)
    let resData = []
    for (let i = 0; i < currisec.data.length; i++) {
      resData.push({
        key: i.toString(),
        curr2_section: currisec.data[i].curr2_section,
        name: curri.data.find(element => {
          return element.curr2_id === currisec.data[i].curr2_id ? 1 : ''
        }).curr2_tname,
        curr2_section_student_amount: currisec.data[i].curr2_section_student_amount,
        curr2_id: currisec.data[i].curr2_id,
      })
    }


    console.log(resData)
    curri2 = curri;
    this.setState({ data: resData, isLoad: false })

  }




  renderTableHeader() {
    let header = columns
    return header.map((columns, index) => {
      return <th className="theader" style={{ "min-width": columns.width }}>{columns.title}</th>
    })
  }

  renderTableData() {
    return this.state.data.map((data, index) => {
      let { curr2_id, curr2_section_student_amount, name, curr2_section, key } = data;//destructuring
      if (this.state.editingKey === key) {
        return (
          <tr>
            <td className="tdata">
              <Input name="curr2_id" type="text" style={{ width: 100 }}
                value={this.state.input.curr2_id} onChange={this.myChangeHandler} />
            </td>
            <td className="tdata">{this.state.input.name}</td>
            <td><Input name="curr2_section" type="text" style={{ width: 100 }}
              value={this.state.input.curr2_section} onChange={this.myChangeHandler} />
            </td>
            <td className="tdata"><Input name="curr2_section_student_amount" type="number" style={{ width: 120 }}
              value={this.state.input.curr2_section_student_amount} onChange={this.myChangeHandler} /></td>
            <td className="tdata">
              <span>
                <Button icon='save' style={{ marginRight: 5 }} onClick={() => this.save(data.key)} />
                <Button icon='stop' onClick={() => this.handleStop(data.key)} />
              </span>
            </td>

          </tr>
        );
      }
      else {
        return (
          <tr key={key}>
            <td className="tdata">{curr2_id}</td>
            <td className="tdata">{name}</td>
            <td className="tdata">{curr2_section}</td>
            <td className="tdata">{curr2_section_student_amount}</td>
            <td className="tdata">
              <span>
                <Button icon='edit' disabled={this.state.editingKey !== ''} style={{ marginRight: 5 }} onClick={() => this.edit(data.key)} />
                <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(data.key)}>
                  <Button disabled={this.state.editingKey !== ''} icon='delete' />
                </Popconfirm>
              </span>
            </td>
          </tr>
        );
      }
    });
  };

  renderAddData() {
    let header = columns
    return header.map((columns, index) => {
      return <th className="theader" style={{ "min-width": columns.width }}>{columns.title}</th>
    })
  }


  edit(key) {
    if (key === '') {
      this.setState({ editingKey: key });
    }
    else {
      let editData = [...this.state.data];
      let index = editData.findIndex(item => key === item.key);
      console.log(index)
      this.setState({
        editingKey: key,
        input: {
          curr2_id: editData[index].curr2_id,
          curr2_section: editData[index].curr2_section,
          curr2_section_student_amount: editData[index].curr2_section_student_amount,
          name: editData[index].name,
        },
      });
    }

  };

  save(key) {
    if (this.state.input.curr2_id === '' || this.state.input.curr2_section === '' || this.state.input.curr2_section_student_amount < 1 || this.state.input.name === '') {
      alert("กรุณากรองให้ถูกต้อง")
      return;
    }
    let newData = [...this.state.data];
    let index = newData.findIndex(item => key === item.key);
    newData[index].name = this.state.input.name;
    newData[index].curr2_id = this.state.input.curr2_id;
    newData[index].curr2_section = this.state.input.curr2_section;
    newData[index].curr2_section_student_amount = this.state.input.curr2_section_student_amount;
    this.setState({
      editingKey: '',
      data: newData,
    });

  };

  handleStop(key) {
    if (this.state.thisAddData === true) {
      const { data } = this.state;
      this.setState({
        data: data.filter(item => item.key !== key),
        thisAddData: false,
      });
    }
    this.edit('');
  };

  myChangeHandler = (event) => {
    let nam = event.target.name;
    let val = event.target.value;
    let curri_name = this.state.input.name
    if (nam === "curr2_id") {
      curri_name = '';
      if (val.length === 2) {
        let index = curri.findIndex(item => val === item.curr2_id);
        if (index > -1) {
          curri_name = curri[index].name
        }
      }
    }
    this.setState({
      input: {
        ...this.state.input,
        [nam]: val,
        name: curri_name,
      }
    });
  }

  handleDelete(key) {
    const { data } = this.state;
    this.setState({
      data: data.filter(item => item.key !== key),

    });
  };

  handleAdd = () => {
    const { count, data } = this.state;
    const newData = {
      key: count.toString(),
      curr2_section: '',
      name: '',
      curr2_section_student_amount: 0,
      curr2_id: '',
    };
    this.setState({
      data: [...data, newData],
      count: count + 1,
      editingKey: newData.key,
      thisAddData: true,
      input: {
        curr2_id: newData.curr2_id,
        curr2_section: newData.curr2_section,
        curr2_section_student_amount: newData.curr2_section_student_amount,
        name: newData.name,
      },

    });
  };

  render() {
    return (
      <div>
        <div>
        </div>
        {this.state.isLoad ? <Spin size="large" /> :
          <div>
            <table>
              <thead>
                {this.renderTableHeader()}
              </thead>
              <tbody>
                {this.renderTableData()}
              </tbody>
            </table>
            <div>
              <Button onClick={this.handleAdd} type="primary" style={{ margin: 16 }} disabled={this.state.editingKey !== ''}>
                Add Data
              </Button>
            </div>
          </div>}
      </div>
    )
  };
}
