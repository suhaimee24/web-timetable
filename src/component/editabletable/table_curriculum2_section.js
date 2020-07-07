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
    curr2_tname: curritest[index].curr2_tname,
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
      curri: curritest, isLoad: true, select: 'all', thisAddData: false,
      search: { curr2_id: 'all' },
      input: { curr2_id: '', curr2_tname: '', curr2_section: '', curr2_section_student_amount: '' },
    }
  }

  componentWillMount() {
    this.getData()
  }

  async getData() {

    let currisec = await axios.get("http://localhost:9000/API/curriculum2_section")
    let resCurri = await axios.get("http://localhost:9000/API/curriculum2")


    //join Table
    let resData = []
    for (let i = 0; i < currisec.data.length; i++) {
      resData.push({
        key: i.toString(),
        curr2_section: currisec.data[i].curr2_section,
        curr2_tname: resCurri.data.find(element => {
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

    console.log(res.data);

  }

  async DeleteData(curr2_id, curr2_section) {
    //convert to int 
    curr2_section = parseInt(curr2_section);

    let res = await axios.delete("http://localhost:9000/API/curriculum2_section/", {
      data: {
        curr2_id: curr2_id,
        curr2_section: curr2_section
      }
    })

    console.log(res.data);

  }



  renderTableHeader() {
    let header = columns
    return header.map((columns) => {
      return <th className="theader" style={{ "min-width": columns.width }}>{columns.title}</th>
    })
  }

  renderTableData() {
    const { curri } = this.state;
    return this.state.data.map((data, index) => {
      let { curr2_id, curr2_section_student_amount, curr2_tname, curr2_section, key } = data;//destructuring
      if (this.state.editingKey === key) {
        return (
          <tr>
            <td className="tdata">
              {this.state.thisAddData ? (
                <Select className="Select_curri" defaultValue={curr2_id} name="selectInput"
                  onChange={this.ChangeInputCurri} >
                  {curri.map((data) => {
                    return <Option value={data.curr2_id}>{data.curr2_tname}</Option>
                  })}
                </Select>) : (curr2_tname)}
            </td>
            <td className="tdata">
              {this.state.thisAddData ? (
                <Input className="Input_curri" name="curr2_section" type="number"
                  value={this.state.input.curr2_section} onChange={this.myChangeHandler} />
              ) : (curr2_section)}
            </td>
            <td className="tdata">
              <Input className="Input_student" name="curr2_section_student_amount" type="number"
                value={this.state.input.curr2_section_student_amount} onChange={this.myChangeHandler} />
            </td>
            <td className="tdata">
              <span>
                <Button icon='save' style={{ marginRight: 5 }} onClick={() => this.Save(data.key)} />
                <Button icon='stop' onClick={() => this.Stop(data.key)} />
              </span>
            </td>

          </tr>
        );
      }
      else {
        return (
          <tr key={key}>
            <td className="tdata">{curr2_tname}</td>
            <td className="tdata">{curr2_section}</td>
            <td className="tdata">{curr2_section_student_amount}</td>
            <td className="tdata">
              <span>
                <Button icon='edit' disabled={this.state.editingKey !== ''} style={{ marginRight: 5 }} onClick={() => this.Edit(data.key)} />
                <Popconfirm title="Sure to delete?" onConfirm={() => this.Delete(data.key)}>
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
    const { curri, search } = this.state;
    return (
      <div className="Search_Display">
        <div className="Search_text">สาขาวิชา</div>
        <Select className="Select_curri" defaultValue={search.curr2_id}
          onChange={this.ChangeSearchCurri} disabled={this.state.editingKey !== ''}>
          <Option value="all">ทั้งหมด</Option>
          {curri.map((data) => {
            return <Option value={data.curr2_id}>{data.curr2_tname}</Option>
          })}
        </Select>
        <Button className="Search_button" onClick={this.ButtonSearch}
          disabled={this.state.editingKey !== ''}>ค้นหา</Button>
      </div>
    )
  }


  Edit(key) {
    const { data } = this.state;
    if (key === '') {
      this.setState({ editingKey: key });
    }
    else {
      let editData = [...data];
      let index = editData.findIndex(item => key === item.key);
      console.log(index)
      this.setState({
        editingKey: key,
        input: {
          curr2_id: editData[index].curr2_id,
          curr2_section: editData[index].curr2_section,
          curr2_section_student_amount: editData[index].curr2_section_student_amount,
          curr2_tname: editData[index].curr2_tname,
        },
      });
    }

  };

  Save(key) {

    const { input, data, alldata, thisAddData } = this.state;

    //ต้องกรอกให้ครบตามช่อง
    if (input.curr2_id === '' || input.curr2_section === '' || input.curr2_section_student_amount < 1 || input.curr2_tname === '') {
      alert("กรุณากรองให้ถูกต้อง")
      return;
    }

    //เช็คว่ามีการซํ้ากันของ curri2_section 
    let check_section = alldata.findIndex(item => input.curr2_section == parseInt(item.curr2_section))
    console.log(`${input.curr2_section} and ${check_section}`)
    if (check_section > -1 && key !== alldata[check_section].key) {
      alert(`section ที่ป้อน ซํ้ากับ section ของสาขา${alldata[check_section].curr2_tname}`);
      return;
    }

    let newData = [...data];
    let allData = [...alldata];
    let index = newData.findIndex(item => key === item.key);
    newData[index].curr2_tname = input.curr2_tname;
    newData[index].curr2_id = input.curr2_id;
    newData[index].curr2_section = input.curr2_section;
    newData[index].curr2_section_student_amount = input.curr2_section_student_amount;

    // set temp Data for send to API
    let temp = newData[index]

    //sort data before show data
    newData = newData.sort(function (a, b) { return a.curr2_section - b.curr2_section });
    newData = newData.sort(function (a, b) { return a.curr2_id - b.curr2_id });

    //check if this state is Add Data
    if (thisAddData === true) {

      this.setState({
        editingKey: '',
        data: newData,
        alldata: [...allData, temp],
        thisAddData: false,
      });

      //call API to Add Data
      this.AddData(
        temp.curr2_id,
        temp.curr2_section,
        temp.curr2_section_student_amount
      );
    }

    //this state is Edit Data
    else {
      //change Data 
      let indexall = allData.findIndex(item => key === item.key);
      allData[indexall].curr2_tname = input.curr2_tname;
      allData[indexall].curr2_id = input.curr2_id;
      allData[indexall].curr2_section = input.curr2_section;
      allData[indexall].curr2_section_student_amount = input.curr2_section_student_amount;

      this.setState({
        editingKey: '',
        data: newData,
        alldata: allData,
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

  Stop(key) {
    const { data, thisAddData } = this.state;
    if (thisAddData === true) {
      this.setState({
        data: data.filter(item => item.key !== key),
        thisAddData: false,
      });
    }
    this.Edit('');
  };

  Delete(key) {
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


  ChangeSearchCurri = (value) => {
    console.log(`Curri selected ${value}`);
    this.setState({
      search: {
        curr2_id: value
      }
    })
  };

  ChangeInputCurri = (value) => {
    const { curri } = this.state;
    let index = curri.findIndex(item => value === item.curr2_id);
    console.log(value)
    this.setState({
      input: {
        ...this.state.input,
        curr2_id: value,
        curr2_tname: curri[index].curr2_tname,
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


  ButtonAdd = () => {
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

  ButtonSearch = () => {
    let { alldata, search } = this.state;
    alldata = alldata.sort(function (a, b) { return a.curr2_section - b.curr2_section })
    alldata = alldata.sort(function (a, b) { return a.curr2_id - b.curr2_id })
    console.log(search)
    if (search.curr2_id === "all") {
      this.setState({
        data: alldata,
      });
    }
    else {
      this.setState({
        data: alldata.filter(item => item.curr2_id === search.curr2_id),
      });
    }
  };

  render() {
    return (
      <div>
        {this.state.isLoad ? <div className="loadscreen"><Spin size="large" /></div> :
          <div>
            <div>{this.renderSearch()}</div>
            <table style={{ margin: '10px' }}>
              <thead>
                {this.renderTableHeader()}
              </thead>
              <tbody>
                {this.renderTableData()}
              </tbody>
            </table>
            <div>
              <Button onClick={this.ButtonAdd} type="primary" style={{ margin: 16 }} disabled={this.state.editingKey !== ''}>
                Add Data
              </Button>
            </div>
          </div>}
      </div>
    )
  };
}
