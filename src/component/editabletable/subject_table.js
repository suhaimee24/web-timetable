import React, { Component } from 'react'
import { Table, Input, InputNumber, Popconfirm, Form, Button, Select, TimePicker } from 'antd';
import './style.css';
import { render } from '@testing-library/react';
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
        name: "-",
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
            return <InputNumber />;
        }
        if (this.props.inputType === 'text') {
            return <Input />;
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

            },
            {
                title: 'ชื่อวิชา',
                dataIndex: 'subject_name',
                editable: true,
                inputType: 'text',
            },
            {
                title: 'กลุ่มวิชา',
                dataIndex: 'subject_section',
                editable: true,
                inputType: 'text',
            },
            {
                title: 'จำนวนชั่วโมง',
                dataIndex: 'teach_hr',
                editable: true,
                inputType: 'number',
            },
            {
                title: 'จำนวนที่รับ',
                dataIndex: 'subject_section_student_amount',
                editable: true,
                inputType: 'number',
            },
            {
                title: 'วันที่สอน',
                dataIndex: 'teach_day',
                editable: true,
                inputType: 'select',
            },
            {
                title: 'เวลาเริ่ม',
                dataIndex: 'teach_time',
                editable: true,
                inputType: 'text',
            },
            {
                title: 'เวลาสิ้นสุด',
                dataIndex: 'teach_time2',
                editable: true,
                inputType: 'text',
            },
            {
                title: 'action',
                dataIndex: 'action',
                render: (text, record) => {
                    const { editingKey } = this.state;
                    const editable = this.isEditing(record);
                    return editable ? (
                        <span>
                            <EditableContext.Consumer>
                                {form => (
                                    <a
                                        onClick={() => this.save(form, record.key)}
                                        style={{ marginRight: 8 }}
                                    >
                                        Save
                                    </a>
                                )}
                            </EditableContext.Consumer>

                            <a onClick={() => this.cancel(record.key)}>Cancel</a>

                        </span>
                    ) : (
                            <span>
                                <a disabled={editingKey !== ''} onClick={() => this.edit(record.key)} style={{ marginRight: 8 }}>
                                    Edit
                                </a>
                                <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
                                    <a disabled={editingKey !== ''}>Delete</a>
                                </Popconfirm>
                            </span>
                        );
                },
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
        const { count, data } = this.state;
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
                    <div style={{display: 'flex','margin':'5px'}}>
                        <div style={{ fontSize: '20px', 'margin-right': '10px', 'margin-left': '10px' }}>ปีการศึกษา</div>
                        <Select defaultValue='2020'>
                            <Option value='2020'>2020</Option>
                            <Option value='2019'>2019</Option>
                        </Select>
                        <div style={{ fontSize: '20px', 'margin-right': '10px', 'margin-left': '10px' }}>ภาคการศึกษา</div>
                        <Select defaultValue='1' >
                            <Option value='1'>1</Option>
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
                        scroll={{ y: '100%' }}
                        size="small"
                    />
                    <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }} disabled={this.state.editingKey !== ''}>
                        Add Data
                    </Button>
                </div>
            </EditableContext.Provider>
        );
    }
}

const EditableFormTable = Form.create()(EditableTable);

export default EditableFormTable;