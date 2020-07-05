import React, { Component } from 'react'
import { Table, Input, InputNumber, Form, Button, Select, TimePicker } from 'antd';
import './style.css';

const { Option } = Select;
const data = [
    {
        key: 0,
        subject_id: '1',
        subject_name: 'การทำตาราง',
        subject_section: '10',
        teach_hr: 3,
        teach_day: 'Mon',
        subject_section_student_amount: 40,
        teach_time: 0,
        teach_time2: 0,
    },
    {
        key: 1,
        subject_id: '1',
        subject_name: 'การทำตาราง',
        subject_section: '10',
        teach_hr: 3,
        teach_day: 'Mon',
        subject_section_student_amount: 40,
        teach_time: 0,
        teach_time2: 0,
    },
    {
        key: 2,
        subject_id: '1',
        subject_name: 'การทำตาราง',
        subject_section: '10',
        teach_hr: 3,
        teach_day: 'Mon',
        subject_section_student_amount: 40,
        teach_time: 0,
        teach_time2: 0,
    },

];
let optionname = [
    {
        name: "None",
    },
    {
        name: "Mon",
    },
    {
        name: "Tue",
    },
    {
        name: "Wed",
    },
    {
        name: "Thu",
    },
    {
        name: "Fri",
    },
    {
        name: "Sat",
    },
    {
        name: "Sun",
    },
];
const EditableContext = React.createContext();

class EditableCell extends Component {

    getInput = () => {
        if (this.props.inputType === 'number') {
            return <InputNumber style={{ width: '100%' }} />;
        }
        if (this.props.inputType === 'text') {
            return <Input style={{ width: '100%' }} />;
        }
        if (this.props.inputType === 'select') {
            return <Select style={{ width: '100%' }} >{
                optionname.map(optionname => {
                    return <Option value={optionname.name}>{optionname.name}</Option>
                })}
            </Select>;
        }
        if (this.props.inputType === 'time') {
            return <TimePicker format={'HH:mm'} />;
        }



    };

    renderCell = ({ getFieldDecorator }) => {
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            children,
            ...restProps
        } = this.props;
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item style={{ margin: 0 }}>
                        {getFieldDecorator(dataIndex, {
                            rules: [
                                {
                                    required: true,
                                    message: `Please Input ${title}!`,
                                },
                            ],
                            initialValue: record[dataIndex],
                        })(this.getInput())}
                    </Form.Item>
                ) : (
                        children
                    )}
            </td>
        );
    };

    render() {
        return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
    }
}

let number_of_item = 8;
class EditableTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data, editingKey: '', count: 3, current: 1 };
        this.columns = [
            {
                title: 'รหัสวิชา',
                dataIndex: 'subject_id',
                editable: true,
                inputType: 'text',
                width: 120,
            },
            {
                title: 'ชื่อวิชา',
                dataIndex: 'subject_name',
                editable: true,
                inputType: 'text',
                width: 300,
            },
            {
                title: 'กลุ่มวิชา',
                dataIndex: 'subject_section',
                editable: true,
                inputType: 'text',
                width: 100,
                align: 'center',
            },
            {
                title: 'สาขาที่เรียน',
                dataIndex: 'curr2_section',
                editable: true,
                inputType: 'text',
                width: 100,
                align: 'center',
            },
            {
                title: 'จำนวนชั่วโมง',
                dataIndex: 'teach_hr',
                editable: true,
                inputType: 'number',
                width: 100,
                align: 'right',
            },
            {
                title: 'จำนวนนักศึกษา',
                dataIndex: 'subject_section_student_amount',
                editable: true,
                inputType: 'number',
                width: 110,
                align: 'right',
            },
            {
                title: 'วันที่สอน',
                dataIndex: 'teach_day',
                editable: true,
                inputType: 'select',
                width: 100,
                align: 'right',
            },
            {
                title: 'เวลาเริ่ม',
                dataIndex: 'teach_time',
                editable: true,
                inputType: 'text',
                width: 100,
                align: 'right',
            },
            {
                title: 'เวลาสิ้นสุด',
                dataIndex: 'teach_time2',
                editable: true,
                inputType: 'text',
                width: 100,
                align: 'right',
            },
            {
                title: 'ทฤษฎี-ปฏิบัติ',
                dataIndex: 'lect_or_prac',
                editable: true,
                inputType: 'text',
                width: 100,
                align: 'center',
            },
            {
                title: 'break_time',
                dataIndex: 'break_time',
                editable: true,
                inputType: 'text',
                width: 100,
                align: 'center',
            },
        ];
    }

    isEditing = record => record.key === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    save(form, key) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.data];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                this.setState({ data: newData, editingKey: '' });
            } else {
                newData.push(row);
                this.setState({ data: newData, editingKey: '' });
            }
        });
    };

    handleDelete = key => {
        const { data } = this.state;
        this.setState({
            data: data.filter(item => item.key !== key),

        });
    };

    edit(key) {
        this.setState({ editingKey: key });
    };

    handleAdd = () => {
        const { count, data } = this.state;
        const newData = {
            key: count,
            subject_id: count,
            subject_name: '',
            teach_hr: 3,
            teach_day: '',
            subject_section_student_amount: 40,
            teach_time: 0,
            teach_time2: 0,
        };
        this.setState({
            data: [...data, newData],
            count: count + 1,
            current: ((data.length + 1) % number_of_item) === 0 ? ((data.length + 1) / number_of_item) : (((data.length + 1) / number_of_item) + 1)
        });
        this.edit(newData.key);

    };

    onChange = page => {
        this.setState({
            current: page,
        });
    }

    render() {
        const components = {
            body: {
                cell: EditableCell,
            },
        };

        const columns = this.columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    dataIndex: col.dataIndex,
                    inputType: col.inputType,
                    title: col.title,
                    editing: this.isEditing(record),
                }),
            };
        });

        return (
            <EditableContext.Provider value={this.props.form}>
                <div className="displatflex-colume">
                    <div style={{ display: 'flex', 'margin': '5px' }}>
                        <div style={{ fontSize: '20px', 'margin-right': '10px', 'margin-left': '10px' }}>ปีการศึกษา</div>
                        <Select defaultValue='2020' style={{ width: 90 }}>
                            <Option value='2020'>2020</Option>
                            <Option value='2019'>2019</Option>
                        </Select>
                        <div style={{ fontSize: '20px', 'margin-right': '10px', 'margin-left': '10px' }}>ภาคการศึกษา</div>
                        <Select defaultValue='1' style={{ width: 50 }}>
                            <Option value='1'>1</Option>
                            <Option value='2'>2</Option>
                        </Select>
                        <div style={{ fontSize: '20px', 'margin-right': '10px', 'margin-left': '10px' }}>สาขาวิชา</div>
                        <Select defaultValue='all' style={{ width: 200 }} >
                            <Option value='all'>ทั้งหมด</Option>
                        </Select>
                        <Button style={{ 'margin-right': '10px', 'margin-left': '10px', background: '#C4C4C4', color: '#000000' }}>ค้นหา</Button>
                    </div>
                    <Table
                        components={components}
                        bordered
                        dataSource={this.state.data}
                        columns={columns}
                        rowClassName="editable-row"
                        pagination={{
                            pageSize: number_of_item,
                            current: this.state.current,
                            disabled: this.state.editingKey !== '',
                            onChange: this.onChange,

                        }}
                        size="small"
                    />
                    <Button type="primary" style={{ marginBottom: 16 }} disabled={this.state.editingKey !== ''}>
                        จัดตารางสอน
                    </Button>
                </div>
            </EditableContext.Provider>
        );
    }
}

const EditableFormTable = Form.create()(EditableTable);

export default EditableFormTable;