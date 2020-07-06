import React, { Component } from 'react'
import { Input, Popconfirm, Button, Spin, Select } from 'antd';
import axios from 'axios'
import './style.css';

const { Option } = Select;
const columns = [
  {
    title: 'สาขาวิขา',
    dataIndex: 'name',
    key: 'name',
    width: 280
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

let curritest = [
  {
    curr2_id: '07',
    curr2_tname: "คอมพิวเตอร์",
  },
  {
    curr2_id: '08',
    curr2_tname: "วัดคุม",
  },
  {
    curr2_id: '09',
    curr2_tname: "อิเล็กทรอนิกส์",
  },
  {
    curr2_id: '10',
    curr2_tname: "โทรคมนาคม",
  },
  {
    curr2_id: '11',
    curr2_tname: "เคมี",
  },
  {
    curr2_id: '12',
    curr2_tname: "แมคคาทรอนิกส์",
  },
];

var datatest = [];
for (let i = 0; i < 20; i++) {
  let index = Math.floor(Math.random() * 5)
  datatest.push({
    key: i.toString(),
    curr2_section: i,
    name: curritest[index].curr2_tname,
    curr2_section_student_amount: 40,
    curr2_id: curritest[index].curr2_id,
  });
}
datatest = datatest.sort(function (a, b) { return a.curr2_section - b.curr2_section });
datatest = datatest.sort(function (a, b) { return a.curr2_id - b.curr2_id });



export default class table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: datatest, alldata: datatest, count: datatest.length, editingKey: '',
      curri: curritest, resData: [], isLoad: true, select: 'all', thisAddData: false,
      input: { curr2_id: '', name: '', curr2_section: '', curr2_section_student_amount: '' },
    }
  }

  componentWillMount() {
    this.getData()
  }

  async getData() {
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
    let resCurri = await axios.get("http://localhost:9000/API/curriculum2")
    // console.log(api.data)

    //join Table
    let resData = []
    for (let i = 0; i < currisec.data.length; i++) {
      resData.push({
        key: i.toString(),
        curr2_section: currisec.data[i].curr2_section,
        name: resCurri.data.find(element => {
          return element.curr2_id === currisec.data[i].curr2_id ? 1 : ''
        }).curr2_tname,
        curr2_section_student_amount: currisec.data[i].curr2_section_student_amount,
        curr2_id: currisec.data[i].curr2_id,
      })
    }
    //sort data by curr2_section and curr2_id
    resData = resData.sort(function (a, b) { return a.curr2_section - b.curr2_section });
    resData = resData.sort(function (a, b) { return a.curr2_id - b.curr2_id });

    console.log(resData)
    console.log(resCurri.data)
    this.setState({
      data: resData, alldata: resData, count: currisec.data.length + 1,
      curri: resCurri.data,
      isLoad: false
    })
  }

  async AddData(curr2_id, curr2_section, curr2_section_student_amount) {
    //convert to int 
    curr2_section = parseInt(curr2_section);
    curr2_section_student_amount = parseInt(curr2_section_student_amount)
    let res = await axios.post("http://localhost:9000/API/curriculum2_section/", {
      curr2_id: curr2_id,
      curr2_section: curr2_section,
      curr2_section_student_amount: curr2_section_student_amount
    })

    console.log(res);
    console.log(res.data);

  }

  async EditData(curr2_id, curr2_section, curr2_section_student_amount) {
    //convert to int 
    curr2_section = parseInt(curr2_section);
    curr2_section_student_amount = parseInt(curr2_section_student_amount)

    let res = await axios.put("http://localhost:9000/API/curriculum2_section/", {
      curr2_id: curr2_id,
      curr2_section: curr2_section,
      curr2_section_student_amount: curr2_section_student_amount
    })

    console.log(res);
    console.log(res.data);

  }

  async DeleteData(curr2_id, curr2_section) {
    //convert to int 
    curr2_section = parseInt(curr2_section);
    console.log(`${curr2_id} and ${curr2_section}`)
    let res = await axios.delete("http://localhost:9000/API/curriculum2_section/", {
      data: {
        curr2_id: curr2_id,
        curr2_section: curr2_section
      }
    })

    console.log(res);
    console.log(res.data);

  }



  renderTableHeader() {
    let header = columns
    return header.map((columns, index) => {
      return <th className="theader" style={{ "min-width": columns.width }}>{columns.title}</th>
    })
  }

  renderTableData() {
    const { curri } = this.state;
    return this.state.data.map((data, index) => {
      let { curr2_id, curr2_section_student_amount, name, curr2_section, key } = data;//destructuring
      if (this.state.editingKey === key) {
        return (
          <tr>
            <td className="tdata">
              {this.state.thisAddData ? (
                <Select defaultValue={curr2_id} style={{ width: 280 }} name="selectInput"
                  onChange={this.selectInput} >
                  {curri.map((data) => {
                    return <Option value={data.curr2_id}>{data.curr2_tname}</Option>
                  })}
                </Select>) : (name)}
            </td>
            <td className="tdata">
              {this.state.thisAddData ? (
                <Input name="curr2_section" type="number" style={{ width: 100 }}
                  value={this.state.input.curr2_section} onChange={this.myChangeHandler} disabled={!this.state.thisAddData} />
              ) : (curr2_section)}
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

  renderSearch() {
    var { curri } = this.state;
    return (
      <div className="displatflex-colume">
        <div style={{ display: 'flex', 'margin': '5px' }}>
          <div style={{ fontSize: '20px', 'margin-right': '10px', 'margin-left': '10px' }}>สาขาวิชา</div>
          <Select defaultValue='all' style={{ width: 280 }} name="select"
            onChange={this.handleChange} disabled={this.state.editingKey !== ''}>
            <Option value="all">ทั้งหมด</Option>
            {curri.map((data) => {
              return <Option value={data.curr2_id}>{data.curr2_tname}</Option>
            })}
          </Select>
          <Button style={{ 'margin-right': '10px', 'margin-left': '10px', background: '#C4C4C4', color: '#000000' }}
            onClick={this.handleSearch} disabled={this.state.editingKey !== ''}>ค้นหา</Button>
        </div>
      </div>
    )
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
    //ต้องกรอกให้ครบตามช่อง
    if (this.state.input.curr2_id === '' || this.state.input.curr2_section === '' || this.state.input.curr2_section_student_amount < 1 || this.state.input.name === '') {
      alert("กรุณากรองให้ถูกต้อง")
      return;
    }

    //เช็คว่ามีการซํ้ากันของ curri2_section 
    let check_section = this.state.alldata.findIndex(item => this.state.input.curr2_section == parseInt(item.curr2_section))
    console.log(`${this.state.input.curr2_section} and ${check_section}`)
    if (check_section > -1 && key !== this.state.alldata[check_section].key) {
      alert(`section ที่ป้อน ซํ้ากับ section ของสาขา${this.state.alldata[check_section].name}`);
      return;
    }

    let newData = [...this.state.data];
    let alldata = [...this.state.alldata];
    let index = newData.findIndex(item => key === item.key);
    newData[index].name = this.state.input.name;
    newData[index].curr2_id = this.state.input.curr2_id;
    newData[index].curr2_section = this.state.input.curr2_section;
    newData[index].curr2_section_student_amount = this.state.input.curr2_section_student_amount;

    // set temp Data for send to API
    let temp = newData[index]

    //sort data before show data
    newData = newData.sort(function (a, b) { return a.curr2_section - b.curr2_section });
    newData = newData.sort(function (a, b) { return a.curr2_id - b.curr2_id });

    //check if this state is Add Data
    if (this.state.thisAddData === true) {


      this.setState({
        editingKey: '',
        data: newData,
        alldata: [...alldata, temp],
        thisAddData: false,
      });

      //call API to Add Data
      this.AddData(
        temp.curr2_id,
        temp.curr2_section,
        temp.curr2_section_student_amount
      );
    }
    else {
      //this state is Edit Data

      //change Data 
      let indexall = alldata.findIndex(item => key === item.key);
      alldata[indexall].name = this.state.input.name;
      alldata[indexall].curr2_id = this.state.input.curr2_id;
      alldata[indexall].curr2_section = this.state.input.curr2_section;
      alldata[indexall].curr2_section_student_amount = this.state.input.curr2_section_student_amount;

      this.setState({
        editingKey: '',
        data: newData,
        alldata: alldata,
        thisAddData: false,
      });

      //call API to Edit Data
      this.EditData(
        temp.curr2_id,
        temp.curr2_section,
        temp.curr2_section_student_amount
      );
    }

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

  handleChange = (value) => {
    console.log(`selected ${value}`);
    this.setState({
      select: value,
    })
  };

  selectInput = (value) => {
    const { curri } = this.state;
    let index = curri.findIndex(item => value === item.curr2_id);
    console.log(value)
    this.setState({
      input: {
        ...this.state.input,
        curr2_id: value,
        name: curri[index].curr2_tname,
      }

    })
  }


  myChangeHandler = (event) => {
    let nam = event.target.name;
    let val = event.target.value;
    if (nam === "curr2_section") {
      if (val.length > 3) {
        alert("section ต้องไม่เกิน 3 หลัก");
        return;
      }

    }
    this.setState({
      input: {
        ...this.state.input,
        [nam]: val,
      }
    });
  };

  handleDelete(key) {
    const { data, alldata } = this.state;
    //find index to delete
    let index = data.findIndex(item => key === item.key);

    // set temp Data for send to API

    let temp = data[index]

    this.setState({
      data: data.filter(item => item.key !== key),
      alldata: alldata.filter(item => item.key !== key),
    });

    //call API to Delete Data
    this.DeleteData(
      temp.curr2_id,
      temp.curr2_section
    );
  };

  handleAdd = () => {
    const { curri } = this.state;
    let index = curri.findIndex(item => this.state.select === item.curr2_id);
    const { count, data } = this.state;
    const newData = {
      key: count.toString(),
      curr2_section: '',
      name: this.state.select === 'all' ? '' : curri[index].curr2_tname,
      curr2_section_student_amount: '',
      curr2_id: this.state.select === 'all' ? '' : this.state.select,
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

  handleSearch = () => {
    let { alldata, select } = this.state;
    alldata = alldata.sort(function (a, b) { return a.curr2_section - b.curr2_section })
    alldata = alldata.sort(function (a, b) { return a.curr2_id - b.curr2_id })
    console.log(select)
    if (select === "all") {
      this.setState({
        data: alldata,
      });
    }
    else {
      this.setState({
        data: alldata.filter(item => item.curr2_id === select),
      });
    }
  };

  render() {
    return (
      <div>
        {this.state.isLoad ? <div className="loadscreen"><Spin size="large" /></div> :
          <div>
            <div>{this.renderSearch()}</div>
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
