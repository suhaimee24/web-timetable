import React, { Component } from 'react'
import { Input, Button, Spin, Select, TimePicker } from 'antd';
import axios from 'axios'
import './style.css';
import moment from 'moment';
import XLSX from 'xlsx'
import { timetable } from './time_table.js'

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
        title: 'กลุ่มวิชา',
        dataIndex: 'subject_section',
        key: 'subject_section',
        width: 70
    },
    {
        title: 'สาขาที่เรียน',
        dataIndex: 'curr2_id',
        key: 'curr2_id',
        width: 140
    },
    {
        title: 'Section',
        dataIndex: 'curr2_section',
        key: 'curr2_section',
        width: 90
    },
    {
        title: 'วันที่สอน',
        dataIndex: 'teach_day',
        key: 'teach_day',
        width: 100
    },
    {
        title: 'เวลาเริ่ม',
        dataIndex: 'teach_time',
        key: 'teach_time',
        width: 90
    },
    {
        title: 'เวลาสิ้นสุด',
        dataIndex: 'teach_time2',
        key: 'teach_time2',
        width: 90
    },
    {
        title: 'ทฤษฎี-ปฏิบัติ',
        dataIndex: 'lect_or_prac',
        key: 'lect_or_prac',
        width: 90
    },
    {
        title: 'break_time',
        dataIndex: 'break_time',
        key: 'break_time',
        width: 90
    },
    // {
    //     title: 'Action',
    //     key: 'action',
    //     width: 100
    // },
];

const subjecttest = [
    {
        subject_id: '01000002',
        subject_ename: "วิชาที่7",
    },
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
    {
        curr2_id: '13',
        curr2_tname: "แมคคาทรอนิกส์2",
    },
];

const daytest = [
    {
        day_id: 'mon',
        day_name: "จันทร์",
    },
    {
        day_id: 'tue',
        day_name: "อังคาร",
    },
    {
        day_id: 'wed',
        day_name: "พุธ",
    },
    {
        day_id: 'thu',
        day_name: "พฤหัสบดี",
    },
    {
        day_id: 'fri',
        day_name: "ศุกร์",
    },
    {
        day_id: 'sat',
        day_name: "เสาร์",
    },
    {
        day_id: 'sun',
        day_name: "อาทิตย์",
    },

];


var datatest = [];
let counttest = 0
// for (let i = 0; i < 20; i++) {
//     let j = Math.floor(Math.random() * 7)
//     datatest.push({
//         key: i.toString(),
//         subject_id: subjecttest[j].subject_id,
//         subject_ename: subjecttest[j].subject_ename,
//         subject_section: Math.floor(Math.random() * 2) + 1,
//         curr2_id: curritest[j].curr2_id,
//         curr2_section: 1,
//         teach_day: daytest[j].day_id,
//         teach_time: '09:30',
//         teach_time2: '12:30',
//         lect_or_prac: 'l',
//         break_time: 0,
//         semester: Math.floor(Math.random() * 2) + 1,
//         year: Math.floor(Math.random() * 3) + 2018,
//     });
// }

datatest = datatest.sort(function (a, b) { return a.subject_section - b.subject_section });
datatest = datatest.sort(function (a, b) { return a.subject_id - b.subject_id });




export default class table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: datatest, alldata: datatest, count: datatest.length, editingKey: '',
            curri: curritest, subject: subjecttest, day: daytest, isLoad: true, thisAddData: false, thisTimeTable: false,
            search: { year: 2020, semester: 1, subject_id: 'all', subject_ename: '', curr2_id: 'all' },
            input: {
                subject_id: '', subject_ename: '', subject_section: '', curr2_section: '',
                teach_day: '', teach_time: '',
                teach_time2: '', lect_or_prac: '', break_time: ''
            },
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
        console.log(token)
        let teachtable = await axios.get("http://localhost:9000/API/teach_table", {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
        teachtable = teachtable.data
        console.log(teachtable)
        let resCurri = await axios.get("http://localhost:9000/API/curriculum2", {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
        resCurri = resCurri.data
        console.log(resCurri)
        let resSub = await axios.get("http://localhost:9000/API/subject", {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
        resSub = resSub.data
        console.log(resSub)
        //join Table
        let resData = []
        for (let i = 0; i < teachtable.length; i++) {
            let item = teachtable[i]
            resData.push({
                key: i.toString(),
                subject_id: item.subject_id,
                subject_section: item.subject_section,
                curr2_section: item.curr2_section,
                semester: item.semester,
                year: item.year,
                curr2_id: item.curr2_id,
                teach_day: item.teach_day,
                teach_time: item.teach_time,
                teach_time2: item.teach_time2,
                lect_or_prac: item.lect_or_prac,
                break_time: item.break_time,
            })
        }
        //sort data by subject_section and subject_id
        resData = resData.sort(function (a, b) { return a.subject_section - b.subject_section });
        resData = resData.sort(function (a, b) { return a.subject_id - b.subject_id });

        this.setState({
            data: resData, alldata: resData, count: resData.length + 1,
            subject: resSub, curri: resCurri,
            isLoad: false
        })
    }

    async AddData(data) {
        //convert to int 
        let res = await axios.post("http://localhost:9000/API/subject_section/", {
            "subject_id": data.subject_id,
            "subject_section": data.subject_section,
            "teach_hr": data.teach_hr,
            "subject_section_student_amount": data.subject_section_student_amount,
            "teach_day": data.teach_day,
            "teach_time": data.teach_time,
            "teach_time2": data.teach_time2,
            "lect_or_prac": data.lect_or_prac,
            "break_time": data.break_time
        })
        console.log(res.data);

    }

    async EditData(data) {
        //convert to int 

        let res = await axios.put("http://localhost:9000/API/subject_section/", {
            "subject_id": data.subject_id,
            "subject_section": data.subject_section,
            "teach_hr": data.teach_hr,
            "subject_section_student_amount": data.subject_section_student_amount,
            "teach_day": data.teach_day,
            "teach_time": data.teach_time,
            "teach_time2": data.teach_time2,
            "lect_or_prac": data.lect_or_prac,
            "break_time": data.break_time
        })

        console.log(res.data);

    }

    async DeleteData(data) {
        //convert to int 

        let res = await axios.delete("http://localhost:9000/API/subject_section/", {
            data: {
                "subject_id": data.subject_id,
                "subject_section": data.subject_section
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
            let { subject_id, subject_ename, subject_section, curr2_id, curr2_section, subject_section_student_amount,
                teach_day, teach_time, teach_time2, lect_or_prac, break_time, key } = data; //destructuring
            const { input, thisAddData, day, curri, subject } = this.state;
            if (this.state.editingKey === key) {
                return (
                    <tr>
                        <td className="tdata">
                            {thisAddData ? (
                                <Input name="subject_id" type="text" style={{ width: 100 }}
                                    value={input.subject_id} onChange={this.myChangeHandler}
                                />) : (subject_id)}
                        </td>
                        <td className="tdata">
                            {input.subject_ename}
                        </td>
                        <td className="tdata">
                            {thisAddData ? (
                                <Input name="subject_section" type="number" style={{ width: 70 }}
                                    value={input.subject_section} onChange={this.myChangeHandler}
                                />) : (subject_section)}
                        </td>
                        <td className="tdata">
                            <Input name="curr2_section" type="number" style={{ width: 80 }}
                                value={input.curr2_section} onChange={this.myChangeHandler}
                            />
                        </td>
                        <td className="tdata">
                            <Select className="Input_day" name="select" defaultValue={teach_day}
                                onChange={this.ChangeInputDay}  >
                                {day.map((data) => {
                                    return <Option className="Input_day" value={data.day_id}>{data.day_name}</Option>
                                })}
                            </Select>
                        </td>
                        <td className="tdata">
                            <TimePicker name="teach_time" format="HH:mm" style={{ width: 80 }} allowClear={false}
                                defaultValue={moment(input.teach_time, 'HH:mm')} onChange={this.ChangeInputTime}
                            />
                        </td>
                        <td className="tdata">
                            <TimePicker name="teach_time2" format="HH:mm" style={{ width: 80 }} allowClear={false}
                                defaultValue={moment(input.teach_time2, 'HH:mm')} onChange={this.ChangeInputTime2}
                            />
                        </td>
                        <td className="tdata">
                            <Select className="Input_lect_or_prac" name="select" defaultValue={lect_or_prac}
                                onChange={this.ChangeInputLect}  >
                                <Option className="Input_day" value='l'>ทฤษฎี</Option>
                                <Option className="Input_day" value='p'>ปฏิบัติ</Option>
                            </Select>
                        </td>
                        <td className="tdata">
                            <Input name="break_time" type="number" style={{ width: 90 }}
                                value={input.break_time} onChange={this.myChangeHandler}
                            />
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
                        <td className="tdata">{subject.find(element => {
                            return element.subject_id === subject_id ? 1 : ''
                        }).subject_ename}</td>
                        <td className="tdata">{subject_section}</td>
                        <td className="tdata">{curri.find(element => {
                            return element.curr2_id === curr2_id ? 1 : ''
                        }).curr2_tname}</td>
                        <td className="tdata">{curr2_section}</td>
                        <td className="tdata">{day.find(element => {
                            return element.day_id === teach_day ? 1 : ''
                        }).day_name}</td>
                        <td className="tdata">{teach_time}</td>
                        <td className="tdata">{teach_time2}</td>
                        <td className="tdata">{lect_or_prac === 'l' ? "ทฤษฎี" : "ปฏิบัติ"}</td>
                        <td className="tdata">{break_time}</td>
                        {/* <td className="tdata">
                            <span>
                                <Button icon='edit' disabled={this.state.editingKey !== ''} style={{ marginRight: 5 }}
                                    onClick={() => this.Edit(data.key)} />
                                <Popconfirm title="Sure to delete?" onConfirm={() => this.Delete(data.key)}>
                                    <Button disabled={this.state.editingKey !== ''} icon='delete' />
                                </Popconfirm>
                            </span>
                        </td> */}
                    </tr>
                );
            }
        });
    };

    renderSearch() {
        const { subject, search, curri } = this.state;
        return (
            <div className="Search_Display" >
                <div className="Search_text" > ปีการศึกษา </div>
                <Select className="Select_semester" name="select" defaultValue={search.year}
                    onChange={this.ChangeSearchYear} disabled={this.state.editingKey !== ''} >
                    <Option className="Select_semester" value={2020} > 2020 </Option>
                    <Option className="Select_semester" value={2019} > 2019 </Option>
                    <Option className="Select_semester" value={2018} > 2018 </Option>
                </Select>
                <div className="Search_text" > ภาคการศึกษา </div>
                <Select className="Select_semester" name="select" defaultValue={search.semester}
                    onChange={this.ChangeSearchSemester} disabled={this.state.editingKey !== ''} >
                    <Option className="Select_semester" value={1} > 1 </Option>
                    <Option className="Select_semester" value={2} > 2 </Option>
                </Select>
                <div className="Search_text">สาขาวิชา</div>
                <Select className="Select_curri" defaultValue={search.curr2_id}
                    onChange={this.ChangeSearchCurri} disabled={this.state.editingKey !== ''}>
                    <Option value="all">ทั้งหมด</Option>
                    {curri.map((data) => {
                        return <Option value={data.curr2_id}>{data.curr2_tname}</Option>
                    })}
                </Select>
                <div className="Search_text">วิชา</div>
                <Select className="Select_subject" name="select" defaultValue={search.subject_id}
                    onChange={this.ChangeSearchSubject} disabled={this.state.editingKey !== ''}>
                    <Option value='all'>วิชาทั้งหมด</Option>
                    {subject.map((data) => {
                        return <Option value={data.subject_id}>{data.subject_ename}</Option>
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
                    subject_id: editData[index].subject_id,
                    subject_ename: editData[index].subject_ename,
                    subject_section: editData[index].subject_section,
                    teach_hr: editData[index].teach_hr,
                    subject_section_student_amount: editData[index].subject_section_student_amount,
                    teach_day: editData[index].teach_day,
                    teach_time: editData[index].teach_time,
                    teach_time2: editData[index].teach_time2,
                    lect_or_prac: editData[index].lect_or_prac,
                    break_time: editData[index].break_time,
                },
            });
        }

    };

    Save(key) {
        const { input, data, alldata, thisAddData } = this.state;
        console.log(input)
        //ต้องกรอกให้ครบตามช่อง
        if (input.subject_id === '' || input.subject_ename === '' || input.subject_section === ''
            || input.teach_hr <= 0 || input.subject_section_student_amount <= 0 || input.teach_day === ''
            || input.teach_time === "00:00" || input.teach_time2 === "00:00" || input.lect_or_prac === '') {
            alert("กรุณากรองให้ถูกต้อง")
            return;
        }

        //เช็คว่ามีการซํ้ากันของ Section
        let check_section = alldata.findIndex(item => (item.subject_id === input.subject_id && item.subject_section == input.subject_section))
        console.log(check_section)
        if (check_section > -1 && key !== alldata[check_section].key) {
            alert(`${alldata[check_section].subject_ename} มี Section ที่ ${alldata[check_section].subject_section} อยู่แล้ว`);
            return;
        }

        let newData = [...data];
        let allData = [...alldata];
        let index = newData.findIndex(item => key === item.key);

        //Set data for change or Add data
        newData[index].subject_id = input.subject_id;
        newData[index].subject_ename = input.subject_ename;
        newData[index].subject_section = input.subject_section;
        newData[index].teach_hr = input.teach_hr;
        newData[index].subject_section_student_amount = input.subject_section_student_amount;
        newData[index].teach_day = input.teach_day;
        newData[index].teach_time = input.teach_time;
        newData[index].teach_time2 = input.teach_time2;
        newData[index].lect_or_prac = input.lect_or_prac;
        newData[index].break_time = input.break_time;

        // set temp Data for send to API
        let temp = newData[index]

        //sort data before show data
        newData = newData.sort(function (a, b) { return a.subject_section - b.subject_section });
        newData = newData.sort(function (a, b) { return a.subject_id - b.subject_id });

        //check if this state is Add Data
        if (thisAddData === true) {

            this.setState({
                editingKey: '',
                data: newData,
                alldata: [...allData, temp],
                thisAddData: false,
            });

            // //call API to Add Data
            // this.AddData(temp);
        }
        //this state is Edit Data
        else {

            //change Data 
            let indexall = allData.findIndex(item => key === item.key);
            allData[indexall].subject_id = input.subject_id;
            allData[indexall].subject_ename = input.subject_ename;
            allData[indexall].subject_section = input.subject_section;
            allData[indexall].teach_hr = input.teach_hr;
            allData[indexall].subject_section_student_amount = input.subject_section_student_amount;
            allData[indexall].teach_day = input.teach_day;
            allData[indexall].teach_time = input.teach_time;
            allData[indexall].teach_time2 = input.teach_time2;
            allData[indexall].lect_or_prac = input.lect_or_prac;
            allData[indexall].break_time = input.break_time;


            this.setState({
                editingKey: '',
                data: newData,
                alldata: allData,
                thisAddData: false,
            });

            // // //call API to Edit Data
            // this.EditData(temp);


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

        // //call API to Delete Data
        // this.DeleteData(temp);
    };

    ChangeSearchYear = (value) => {
        this.setState({
            search: {
                ...this.state.search,
                year: value,
            }
        })
    };

    ChangeSearchSemester = (value) => {
        this.setState({
            search: {
                ...this.state.search,
                semester: value,
            }
        })
    };

    ChangeSearchCurri = (value) => {
        this.setState({
            search: {
                ...this.state.search,
                curr2_id: value,

            }
        })
    };

    ChangeSearchSubject = (value) => {
        const { subject } = this.state
        let index = subject.findIndex(item => value === item.subject_id);
        if (index > -1) {
            this.setState({
                search: {
                    ...this.state.search,
                    subject_id: value,
                    subject_ename: subject[index].subject_ename,
                }
            })
        }
        else {
            this.setState({
                search: {
                    ...this.state.search,
                    subject_id: value,
                    subject_ename: '',
                }
            })
        }

    };

    ChangeInputDay = (value) => {
        this.setState({
            input: {
                ...this.state.input,
                teach_day: value,
            }
        })
    }

    ChangeInputLect = (value) => {
        this.setState({
            input: {
                ...this.state.input,
                lect_or_prac: value,
            }
        })
    }

    ChangeInputTime = (time, timeString) => {
        this.setState({
            input: {
                ...this.state.input,
                teach_time: timeString,
            }
        })

    }

    ChangeInputTime2 = (time, timeString) => {
        this.setState({
            input: {
                ...this.state.input,
                teach_time2: timeString,
            }
        })
    }

    myChangeHandler = (event) => {
        const { input } = this.state;
        let name = event.target.name;
        let value = event.target.value;
        let subject_ename = input.subject_ename
        if (name === "subject_id") {
            subject_ename = ''
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
        if (name === "subject_section") {
            if (value.length > 3) {
                alert("Section ต้องไม่เกิน 3 หลัก");
                return;
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
            subject_id: search.subject_id === 'all' ? '' : search.subject_id,
            subject_ename: search.subject_id === 'all' ? '' : search.subject_ename,
            subject_section: '',
            teach_hr: '',
            subject_section_student_amount: '',
            teach_day: '',
            teach_time: '00:00',
            teach_time2: '00:00',
            lect_or_prac: '',
            break_time: 0,
        };
        this.setState({
            data: [...data, newData],
            count: count + 1,
            editingKey: newData.key,
            thisAddData: true,
            input: {
                subject_id: newData.subject_id,
                subject_ename: newData.subject_ename,
                subject_section: newData.subject_section,
                teach_hr: newData.teach_hr,
                subject_section_student_amount: newData.subject_section_student_amount,
                teach_day: newData.teach_day,
                teach_time: newData.teach_time,
                teach_time2: newData.teach_time2,
                lect_or_prac: newData.lect_or_prac,
                break_time: newData.break_time,
            },

        });
    };

    ButtonSearch = () => {
        let { alldata, search } = this.state;
        // alldata = alldata.sort(function (a, b) { return a.curr2_id - b.curr2_id })
        // alldata = alldata.sort(function (a, b) { return a.subject_section - b.subject_section })
        // alldata = alldata.sort(function (a, b) { return a.subject_id - b.subject_id })
        console.log(search)
        if (search.subject_id === "all" && search.curr2_id === 'all') {
            console.log(alldata.filter(item => (item.year === search.year && item.semester === search.semester)))
            this.setState({
                data: alldata.filter(item => (item.year === search.year && item.semester === search.semester)),
            });
            return;
        }
        if (search.subject_id === "all") {
            console.log(alldata.filter(item => (item.year === search.year && item.semester === search.semester
                && item.curr2_id === search.curr2_id)))
            this.setState({
                data: alldata.filter(item => (item.year === search.year && item.semester === search.semester
                    && item.curr2_id === search.curr2_id)),
            });
            return;
        }
        if (search.curr2_id === 'all') {
            console.log(alldata.filter(item => (item.year === search.year && item.semester === search.semester
                && item.subject_id === search.subject_id)))
            this.setState({
                data: alldata.filter(item => (item.year === search.year && item.semester === search.semester &&
                    item.subject_id === search.subject_id)),
            });
            return;
        }
        console.log(alldata.filter(item => (item.year === search.year && item.semester === search.semester
            && item.subject_id === search.subject_id && item.curr2_id === search.curr2_id)))
        this.setState({
            data: alldata.filter(item => (item.year === search.year && item.semester === search.semester
                && item.subject_id === search.subject_id && item.curr2_id === search.curr2_id)),
        });
        return;

    };

    ButtonExport = () => {
        console.log("Export")
        const { data, curri, day, subject } = this.state
        if (data.length === 0) {
            alert("ยังไม่มีข้อมูลไม่สามารถ Export ได้")
            return;
        }
        let temp = []
        data.forEach(item => {
            temp.push({
                'รหัสวิชา': item.subject_id,
                'ชื่อวิชา': subject.find(element => {
                    return element.subject_id === item.subject_id ? 1 : ''
                }).subject_ename,
                'กลุ่มวิชา': item.subject_section,
                'สาขาที่เรียน': curri.find(element => {
                    return element.curr2_id === item.curr2_id ? 1 : ''
                }).curr2_tname,
                'Section': item.curr2_section,
                'วันที่สอน': day.find(element => {
                    return element.day_id === item.teach_day ? 1 : ''
                }).day_name,
                'เวลาเริ่ม': item.teach_time,
                'เวลาสิ้นสุด': item.teach_time2,
                'ทฤษฎี-ปฏิบัติ': item.lect_or_prac === 'l' ? "ทฤษฎี" : "ปฏิบัติ",
                break_time: item.break_time,
            })
        })

        const dataWS = XLSX.utils.json_to_sheet(temp)
        console.log(dataWS)
        let wscols = [
            { wch: 15 },
            { wch: 30 },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 }
        ];
        dataWS['!cols'] = wscols

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, dataWS)
        XLSX.writeFile(wb, 'Teach_table.xlsx')

        return;

    };

    ButtonTimeTable = async () => {
        let Data = await timetable()
        console.log('test', Data)
        this.setState({
            data: Data,
            alldata: Data,
            thisTimeTable:true
        })
    }

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
                            <Button onClick={this.ButtonTimeTable} type="primary" style={{ margin: 16 }} disabled={this.state.thisTimeTable}>
                                จัดตารางสอน
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
