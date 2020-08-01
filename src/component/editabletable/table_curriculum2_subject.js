import React, { Component } from 'react'
import { Input, Popconfirm, Button, Spin, Select } from 'antd';
import axios from 'axios'
import './style.css';
import XLSX from 'xlsx'

const { Option } = Select;

//Data for test
const columns = [
    {
        title: 'รหัสวิชา',
        dataIndex: 'subject_id',
        key: 'subject_id',
        width: 100
    },
    {
        title: 'ชื่อวิชา',
        dataIndex: 'subject_ename',
        key: 'subject_ename',
        width: 300
    },
    {
        title: 'ภาคการศึกษา',
        dataIndex: 'semester',
        key: 'semester',
        width: 100
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

const subjecttest = [
    {
        subject_id: '11111111',
        subject_ename: "วิชาที่1",
    },
    {
        subject_id: '22222222',
        subject_ename: "วิชาที่2",
    },
    {
        subject_id: '33333333',
        subject_ename: "วิชาที่3",
    },
    {
        subject_id: '44444444',
        subject_ename: "วิชาที่4",
    },
    {
        subject_id: '55555555',
        subject_ename: "วิชาที่5",
    },
    {
        subject_id: '66666666',
        subject_ename: "วิชาที่6",
    },
    {
        subject_id: '01000002',
        subject_ename: "วิชาที่7",
    },
];

var datatest = [];
let counttest = 0
for (let i = 0; i < curritest.length; i++) {
    for (let j = 0; j < subjecttest.length; j++) {
        datatest.push({
            key: counttest.toString(),
            subject_id: subjecttest[j].subject_id,
            subject_ename: subjecttest[j].subject_ename,
            semester: Math.floor(Math.random() * 2) + 1,
            curr2_id: curritest[i].curr2_id,
        });
        counttest++;
    }
}
datatest = datatest.sort(function (a, b) { return a.subject_id - b.subject_id });
datatest = datatest.sort(function (a, b) { return a.curr2_id - b.curr2_id });
let datatemp = datatest.filter(item => (item.curr2_id === "07" && item.semester === 1))



export default class table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: datatemp, alldata: datatest, count: datatest.length, editingKey: '', token: '',
            curri: curritest, subject: subjecttest, isLoad: true, thisAddData: false,
            search: { semester: 1, curr2_id: '01' },
            input: { curr2_id: '', subject_id: '', subject_ename: '', semester: '' },
        }
    }
    componentWillMount() {
        this.getData()
    }

    async getData() {
        let token = await axios.post("http://localhost:9000/API/login", {
            username: 'admin',
            password: '1234'
        })
        token = token.data;

        let currisub = await axios.get("http://localhost:9000/API/curriculum2_subject", {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
        let resCurri = await axios.get("http://localhost:9000/API/curriculum2", {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
        let resSub = await axios.get("http://localhost:9000/API/subject", {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
        resSub = resSub.data
        //let resSub = subjecttest
        console.log(currisub.data)
        console.log(resCurri.data)
        console.log(resSub)
        //join Table
        let resData = []
        for (let i = 0; i < currisub.data.length; i++) {
            resData.push({
                key: i.toString(),
                subject_id: currisub.data[i].subject_id,
                subject_ename: resSub.find(element => {
                    return element.subject_id === currisub.data[i].subject_id ? 1 : ''
                }).subject_ename,
                semester: currisub.data[i].semester,
                curr2_id: currisub.data[i].curr2_id,
            })
        }
        //sort data by curr2_section and curr2_id
        resData = resData.sort(function (a, b) { return a.subject_id - b.subject_id });
        resData = resData.sort(function (a, b) { return a.curr2_id - b.curr2_id });

        let datatemp = resData.filter(item => (item.curr2_id === this.state.search.curr2_id && item.semester === this.state.search.semester))
        this.setState({
            data: datatemp, alldata: resData, count: currisub.data.length + 1, token: token,
            curri: resCurri.data, subject: resSub,
            isLoad: false
        })
    }

    async AddData(curr2_id, subject_id, semester) {
        //convert to int 

        let res = await axios.post("http://localhost:9000/API/curriculum2_subject/", {
            curr2_id: curr2_id,
            subject_id: subject_id,
            semester: semester
        }, {
            headers: {
                Authorization: 'Bearer ' + this.state.token
            }
        })

        console.log(res.data);

    }

    async EditData(curr2_id, subject_id, semester) {
        //convert to int 

        let res = await axios.put("http://localhost:9000/API/curriculum2_subject/", {
            curr2_id: curr2_id,
            subject_id: subject_id,
            semester: semester
        }, {
            headers: {
                Authorization: 'Bearer ' + this.state.token
            }
        })

        console.log(res.data);

    }

    async DeleteData(curr2_id, subject_id, semester) {
        //convert to int 

        let res = await axios.delete("http://localhost:9000/API/curriculum2_subject/", {
            data: {
                curr2_id: curr2_id,
                subject_id: subject_id,
                semester: semester
            },
            headers: {
                Authorization: 'Bearer ' + this.state.token
            }
        })

        console.log(res.data);

    }



    renderTableHeader() {
        let header = columns
        return header.map((columns, index) => {
            return <th className="theader" style={{ "min-width": columns.width }}>{columns.title}</th>
        })
    }

    renderTableData() {
        return this.state.data.map((data) => {
            let { subject_id, subject_ename, semester, key } = data;//destructuring
            if (this.state.editingKey === key) {
                return (
                    <tr>
                        <td className="tdata">
                            {this.state.thisAddData ? (
                                <Input name="subject_id" type="text" style={{ width: 100 }}
                                    value={this.state.input.subject_id} onChange={this.myChangeHandler}
                                />) : (subject_id)}
                        </td>
                        <td className="tdata">
                            {this.state.input.subject_ename}
                        </td>
                        <td className="tdata">
                            <Select className="Input_semester" name="select" defaultValue={semester}
                                onChange={this.ChangeInputSemester}  >
                                <Option className="Input_semester" value={1} > 1 </Option>
                                <Option className="Input_semester" value={2} > 2 </Option>
                            </Select>
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
                        <td className="tdata">{subject_id}</td>
                        <td className="tdata">{subject_ename}</td>
                        <td className="tdata">{semester}</td>
                        <td className="tdata">
                            <span>
                                <Button icon='edit' disabled={this.state.editingKey !== ''} style={{ marginRight: 5 }}
                                    onClick={() => this.Edit(data.key)} />
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
            <div className="Search_Display" >
                <div className="Search_text">สาขาวิชา</div>
                <Select className="Select_curri" name="select" defaultValue={search.curr2_id}
                    onChange={this.ChangeSearchCurri} disabled={this.state.editingKey !== ''}>
                    {curri.map((data) => {
                        return <Option value={data.curr2_id}>{data.curr2_tname}</Option>
                    })}
                </Select>
                <div className="Search_text" > ภาคการศึกษา </div>
                <Select className="Select_semester" name="select" defaultValue={search.semester}
                    onChange={this.ChangeSearchSemester} disabled={this.state.editingKey !== ''} >
                    <Option className="Select_semester" value={1} > 1 </Option>
                    <Option className="Select_semester" value={2} > 2 </Option>
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
                    subject_id: editData[index].subject_id,
                    subject_ename: editData[index].subject_ename,
                    semester: editData[index].semester,
                },
            });
        }

    };

    Save(key) {
        const { input, data, alldata, curri, thisAddData } = this.state;
        console.log(input)
        //ต้องกรอกให้ครบตามช่อง
        if (input.subject_id === '' || input.subject_ename === '' || input.semester === '') {
            alert("กรุณากรองให้ถูกต้อง")
            return;
        }

        //เช็คว่ามีการซํ้ากันของวิชา
        let check_subject = alldata.findIndex(item => (item.subject_id === input.subject_id && item.curr2_id === input.curr2_id))
        let index_curri = curri.findIndex(item => (item.curr2_id === input.curr2_id))
        if (check_subject > -1 && key !== alldata[check_subject].key) {
            alert(`ในสาขา${curri[index_curri].curr2_tname} วิชา${alldata[check_subject].subject_ename} มีอยู่แล้วในเทอมที่ ${alldata[check_subject].semester}`);
            return;
        }

        let newData = [...data];
        let allData = [...alldata];
        let index = newData.findIndex(item => key === item.key);

        //save old data for call API
        const oldData = newData[index].semester;

        newData[index].subject_id = input.subject_id;
        newData[index].curr2_id = input.curr2_id;
        newData[index].subject_ename = input.subject_ename;
        newData[index].semester = input.semester;

        // set temp Data for send to API
        let temp = newData[index]

        //sort data before show data
        newData = newData.sort(function (a, b) { return a.subject_id - b.subject_id });
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
                temp.subject_id,
                temp.semester
            );
        }
        //this state is Edit Data
        else {

            //change Data 
            let indexall = allData.findIndex(item => key === item.key);
            allData[indexall].subject_id = input.subject_id;
            allData[indexall].curr2_id = input.curr2_id;
            allData[indexall].subject_ename = input.subject_ename;
            allData[indexall].semester = input.semester;

            this.setState({
                editingKey: '',
                data: newData,
                alldata: allData,
                thisAddData: false,
            });

            //don't have Edit API must be Delete and Add 
            //js have a link to Object but i want a old data
            this.DeleteData(
                temp.curr2_id,
                temp.subject_id,
                oldData
            );

            this.AddData(
                temp.curr2_id,
                temp.subject_id,
                temp.semester
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
            temp.subject_id,
            temp.semester
        );
    };


    ChangeSearchCurri = (value) => {
        this.setState({
            search: {
                ...this.state.search,
                curr2_id: value,
            }
        }, () => {
            this.ButtonSearch()
        })
    };

    ChangeSearchSemester = (value) => {
        this.setState({
            search: {
                ...this.state.search,
                semester: value,
            }
        }, () => {
            this.ButtonSearch()
        })

    };

    ChangeInputSemester = (value) => {
        this.setState({
            input: {
                ...this.state.input,
                semester: value,
            }
        })
    }

    myChangeHandler = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        let subject_ename = ''
        if (name === "subject_id") {
            if (value.length > 8) {
                alert("รหัสวิชาไม่เกิน 8 หลัก");
                return;
            }
            if (value.length === 8) {
                const { subject } = this.state
                let index = subject.findIndex(item => value === item.subject_id);
                if (index > -1) {
                    subject_ename = subject[index].subject_ename
                }
                else {
                    subject_ename = ''
                }
            }
        }
        this.setState({
            input: {
                ...this.state.input,
                subject_ename: subject_ename,
                [name]: value,
            }
        });
    };


    ButtonAdd = () => {
        const { count, data, search } = this.state;
        const newData = {
            key: count.toString(),
            subject_id: '',
            subject_ename: '',
            semester: search.semester === 'all' ? '' : search.semester,
            curr2_id: search.curr2_id,
        };
        this.setState({
            data: [...data, newData],
            count: count + 1,
            editingKey: newData.key,
            thisAddData: true,
            input: {
                subject_id: newData.subject_id,
                subject_ename: newData.subject_ename,
                semester: newData.semester,
                curr2_id: newData.curr2_id,
            },

        });
    };

    ButtonSearch = () => {
        let { alldata, search } = this.state;
        alldata = alldata.sort(function (a, b) { return a.subject_id - b.subject_id })
        alldata = alldata.sort(function (a, b) { return a.curr2_id - b.curr2_id })
        console.log(search)
        this.setState({
            data: alldata.filter(item => (item.curr2_id === search.curr2_id && item.semester === search.semester)),
        });

    };

    ButtonExport = () => {
        console.log("Export")
        const { data, curri, day } = this.state
        if (data.length === 0) {
            alert("ยังไม่มีข้อมูลไม่สามารถ Export ได้")
            return;
        }
        let temp = []
        data.forEach(item => {
            temp.push({
                'รหัสวิชา': item.subject_id,
                'ชื่อวิชา': item.subject_ename,
                'ภาคการศึกษา': item.semester,
            })
        })

        const dataWS = XLSX.utils.json_to_sheet(temp)
        console.log(dataWS)
        let wscols = [
            { wch: 15 },
            { wch: 30 },
            { wch: 15 },
        ];
        dataWS['!cols'] = wscols

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, dataWS)
        XLSX.writeFile(wb, 'Curriculum_Subject.xlsx')

        return;

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
                            <Button onClick={this.ButtonExport} type="primary" style={{ margin: 16 }} disabled={this.state.editingKey !== ''}>
                                Export
                            </Button>
                        </div>
                    </div>}
            </div>
        )
    };
}
