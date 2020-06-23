import React, { Component } from 'react'
import { Table, Input, InputNumber, Popconfirm, Form, Button, Select, Icon } from 'antd';
import './style.css';
import { render } from '@testing-library/react';
const { Option } = Select;
const data = [
  {
    key: 0,
    curr2_section: '1',
    name: 'คอมพิวเตอร์',
    curr2_section_student_amount: 40,
    curr2_id: '10',
  },
  {
    key: 1,
    curr2_section: '2',
    name: 'คอมพิวเตอร์',
    curr2_section_student_amount: 40,
    curr2_id: '10',
  },
  {
    key: 2,
    curr2_section: '3',
    name: 'คอมพิวเตอร์',
    curr2_section_student_amount: 40,
    curr2_id: '10',
  },

];
let curri = [
  {
    name: "คอมพิวเตอร์",
  },
  {
    name: "วัดคุม",
  },
  {
    name: "อิเล็กทรอนิกส์",
  },
  {
    name: "โทรคมนาคม",
  },
  {
    name: "เคมี",
  },
  {
    name: "แมคคาทรอนิกส์",
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
        curri.map(curri => {
          return <option value={curri.name}>{curri.name}</option>
        })}
      </Select>;
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
        title: 'สาขาวิขา',
        dataIndex: 'name',
        editable: true,
        inputType: 'select',
        width: 300,
      },
      {
        title: 'section',
        dataIndex: 'curr2_section',
        editable: true,
        inputType: 'text',
        width: 100,
        align:'center',
      },
      {
        title: 'จำนวนวนักศึกษา',
        dataIndex: 'curr2_section_student_amount',
        editable: true,
        inputType: 'number',
        width: 120,
        align:'right',
      },
      {
        title: 'action',
        dataIndex: 'action',
        width: 120,
        align:'center',
        render: (text, record) => {
          const { editingKey } = this.state;
          const editable = this.isEditing(record);
          return editable ? (
            <span>
              <EditableContext.Consumer>
                {form => (
                  <Button
                    onClick={() => this.save(form, record.key)}
                    style={{ marginRight: 5 }}
                  >
                    <Icon type='save' />
                  </Button>
                )}
              </EditableContext.Consumer>

              <Button onClick={() => this.cancel(record.key)}><Icon type='stop' /></Button>

            </span>
          ) : (
              <span>
                <Button disabled={editingKey !== ''} onClick={() => this.edit(record.key)} style={{ marginRight: 5 }}>
                  <Icon type='edit'/>
                </Button>
                <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
                  <Button disabled={editingKey !== ''}><Icon type='delete'/></Button>
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
      curr2_section: count,
      name: '',
      curr2_section_student_amount: 0,
      curr2_id: count,
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
            <div style={{ fontSize: '20px', 'margin-right': '10px', 'margin-left': '10px' }}>พ.ศ.</div>
            <Select defaultValue='2020' style={{ width: 90, }}>
              <Option value='2020'>2020</Option>
              <Option value='2019'>2019</Option>
            </Select>
            <div style={{ fontSize: '20px', 'margin-right': '10px', 'margin-left': '10px' }}>สาขาวิชา</div>
            <Select defaultValue='all' style={{ width:200,}}>
              <Option value='all'>ทั้งหมด</Option>
            </Select>
            <Button style={{ 'margin-right': '10px', 'margin-left': '10px', background: '#C4C4C4', color: '#000000' }}>ค้นหา</Button>
          </div>
          <div>
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
          </div>
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