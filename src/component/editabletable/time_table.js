const axios = require('axios');

//Set Global variable
var time_CurriSec = [];
var uniqueSubject = [];

async function timetable() {

    //Get Data from DataBase
    let token = await axios.post("http://localhost:9000/API/login", {
        username: 'admin',
        password: '1234'
    })
    token = token.data;
    console.log(token);

    let currisub = await axios.get("http://localhost:9000/API/curriculum2_subject", {
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
    currisub = currisub.data;

    let currisec = await axios.get("http://localhost:9000/API/curriculum2_section", {
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
    currisec = currisec.data;

    let SubSec = await axios.get("http://localhost:9000/API/subject_section", {
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
    SubSec = SubSec.data;

    // // Print for check Data from DB
    // console.log(currisub);
    // console.log(currisec);
    // console.log(SubSec);

    // Set Data before Calculate
    uniqueSubject = getUniqueSubject(SubSec);
    time_CurriSec = getTime_CurriSec(currisec);

    //Print for Check Data
    // console.log('uniqueSubject ');
    // console.log(uniqueSubject);
    // //PrintTable(time_CurriSec);
    // //console.log('time_CurriSec', time_CurriSec);
    // console.log('');


    // Sort dy  priority
    uniqueSubject = uniqueSubject.sort(function (a, b) { return a.section_sum - b.section_sum });
    uniqueSubject = uniqueSubject.sort(function (a, b) { return getPriority(a.subject_id) - getPriority(b.subject_id) });
    console.log('uniqueSubject ');
    console.log(uniqueSubject);

    for (let i = 0; i < uniqueSubject.length; i++) {
        console.log('----------------------------------------------------------')
        console.log(' subject_id : ', uniqueSubject[i].subject_id)

        // find all Curri have to subject id
        let curri = currisub.filter(item => item.subject_id === uniqueSubject[i].subject_id)
        //console.log('curri',curri)

        // find all section in curri
        let DataCurriSec = [];
        curri.forEach(el => {
            let section = currisec.filter(item => item.curr2_id === el.curr2_id)
            section.forEach(item => {
                DataCurriSec.push(item)
            })
        })

        // oder by priority number of section first
        DataCurriSec = DataCurriSec.sort(function (a, b) { return a.curr2_id - b.curr2_id });

        //Print DataCurriSec
        process.stdout.write(' DataCurriSec : ')
        DataCurriSec.forEach(item => {
            process.stdout.write(item.curr2_section + ' ')
        })
        console.log("")

        // get All Subject Section
        let DataSubjectSec = SubSec.filter(item => item.subject_id === uniqueSubject[i].subject_id && item.lect_or_prac === uniqueSubject[i].lect_or_prac)

        //Print DataSubjectSec
        process.stdout.write(' DataSubjectSec : ')
        DataSubjectSec.forEach(item => {
            process.stdout.write(item.subject_section + ' ')
        })
        console.log("")

        for (let j = 0; j < DataSubjectSec.length; j++) {
            console.log(`----DataSubjectSec ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section}----`)

            // Set for prioty 0
            if (getPriority(DataSubjectSec[j].subject_id) === 0) {
                let time_CurriSec_index = time_CurriSec.findIndex(item => (DataSubjectSec[j].subject_section === item.curr2_section))
                if (time_CurriSec_index > -1) {
                    time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSec[j])
                }
                continue
            }

            //Find Curri Section is not overlay for this Subject Section
            let CheckedDataSubjectSec = [];
            for (let k = 0; k < DataCurriSec.length; k++) {
                let time_CurriSec_index = time_CurriSec.findIndex(item => (DataCurriSec[k].curr2_section === item.curr2_section))
                let check = 1
                time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                    if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {
                        check = -1
                        return;
                    }
                })
                if (check === 1) {
                    CheckedDataSubjectSec.push(DataCurriSec[k])
                }

            }
            //console.log(CheckedDataSubjectSec)

            CheckedDataSubjectSec
            //Print DataCurriSec
            process.stdout.write('CheckedDataSubjectSec ')
            CheckedDataSubjectSec.forEach(item => {
                process.stdout.write(item.curr2_section + ' ')
            })
            console.log("")

            //don't have any curri to add in this subject section
            if (CheckedDataSubjectSec.length === 0) {
                console.log("No Curri_Sec can push in this Sub_Sec")
                continue
            }

            // 1 by 1
            if (DataSubjectSec[j].subject_section_student_amount === null) {
                let time_CurriSec_index = time_CurriSec.findIndex(item => (CheckedDataSubjectSec[0].curr2_section === item.curr2_section))
                let check = 1
                time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSec[j])
                DataCurriSec = DataCurriSec.filter(item => item.curr2_section !== CheckedDataSubjectSec[0].curr2_section)


                continue
            }

            // Find path for min Num
            allpath = [];
            SumOfNum(CheckedDataSubjectSec, CheckedDataSubjectSec.length)
            //console.log('allpath', allpath)

            let min = DataSubjectSec[j].subject_section_student_amount;
            let dataPath = [];
            for (let k = 0; k < allpath.length; k++) {
                let NumOfStuMin = DataSubjectSec[j].subject_section_student_amount - allpath[k].sum
                if (NumOfStuMin >= 0 && min > NumOfStuMin) {
                    console.log('NumOfStuMin', NumOfStuMin)
                    min = NumOfStuMin
                    dataPath = allpath[k]
                }
            }
            console.log(dataPath)
            if (dataPath.length === 0)
                continue
            for (let k = 0; k < dataPath.path.length; k++) {
                console.log(dataPath.path[k])
                let time_CurriSec_index = time_CurriSec.findIndex(item => (dataPath.path[k] === item.curr2_section))
                time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSec[j])
                DataCurriSec = DataCurriSec.filter(item => item.curr2_section !== dataPath.path[k])

            }


        }
        console.log('')
    }
    PrintTable(time_CurriSec)
}

//Set Global variable 
var tempData = [];
var allpath = [];

function SumOfNum(data, num) {
    for (let i = num; i > 0; i--) {
        tempData = data
        SumOfNumRe(tempData, i, 0, [])
    }
}

function SumOfNumRe(tempdata, num, sum, path) {
    if (num === 0) {
        let index = allpath.findIndex(item => item.sum === sum);
        if (index > -1)
            return
        allpath.push({ sum: sum, path: path })
        return;
    }
    for (let i = 0; i < tempdata.length; i++) {
        let temp = tempdata[i]
        tempData = tempdata.filter(item => item.curr2_section !== tempdata[i].curr2_section);
        SumOfNumRe(tempData, num - 1, sum + temp.curr2_section_student_amount, [...path, temp.curr2_section])
    }
}

function DaytoInt(teach_day) {
    var day = ['', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    return day.findIndex(item => teach_day === item)
}

function decimalHours(time) {
    let str = time.split(":");
    return (parseInt(str[0]) * 60 + parseInt(str[1]));
}

function CheckTimeOverlay(subject1, subject2) {
    // 1 not overlay -1 overlay
    if (subject1.teach_day !== subject2.teach_day)
        return 1

    // start subject 2 in time subject 1
    if (decimalHours(subject1.teach_time) <= decimalHours(subject2.teach_time) &&
        decimalHours(subject2.teach_time) <= decimalHours(subject1.teach_time2)) {
        return -1
    }
    // start subject 1 in time subject 2
    if (decimalHours(subject2.teach_time) <= decimalHours(subject1.teach_time) &&
        decimalHours(subject1.teach_time) <= decimalHours(subject2.teach_time2)) {
        return -1
    }
    // end subject 2 in time subject 1
    if (decimalHours(subject1.teach_time) <= decimalHours(subject2.teach_time2) &&
        decimalHours(subject2.teach_time2) <= decimalHours(subject1.teach_time2)) {
        return -1
    }
    // end subject 2 in time subject 1
    if (decimalHours(subject2.teach_time) <= decimalHours(subject1.teach_time2) &&
        decimalHours(subject1.teach_time2) <= decimalHours(subject2.teach_time2)) {
        return -1
    }
    return 1
}

function PrintTable(time_CurriSec) {
    console.log("------------ TIME TABLE ------------")
    for (let i = 0; i < time_CurriSec.length; i++) {
        let thisData = time_CurriSec[i];
        process.stdout.write(`  curr2_id ${thisData.curr2_id} curr2_section ${thisData.curr2_section}\n`)

        // Sort Data
        thisData.subject = thisData.subject.sort(function (a, b) { return a.subject_id - b.subject_id });
        thisData.subject = thisData.subject.sort(function (a, b) { return decimalHours(a.teach_time) - decimalHours(b.teach_time) });
        thisData.subject = thisData.subject.sort(function (a, b) { return DaytoInt(a.teach_day) - DaytoInt(b.teach_day) });

        for (let j = 0; j < thisData.subject.length; j++) {
            let thisData2 = thisData.subject[j]
            process.stdout.write(`    Subject ${thisData2.subject_id} Section ${thisData2.subject_section} `)
            process.stdout.write(`Day ${thisData2.teach_day} Time ${thisData2.teach_time} to ${thisData2.teach_time2} L_P ${thisData2.lect_or_prac}\n`)
        }
        console.log('')

    }
    console.log("------------ END TIME TABLE ------------\n")
}

function getUniqueSubject(SubSec) {
    var unique_Subject = [];
    SubSec.forEach((el) => {
        let index = unique_Subject.findIndex(item => (el.subject_id === item.subject_id && el.lect_or_prac === item.lect_or_prac));
        if (index === -1) {
            unique_Subject.push({ subject_id: el.subject_id, lect_or_prac: el.lect_or_prac, section_sum: 1 })
        }
        else {
            unique_Subject[index].section_sum++;
        }
    });
    return unique_Subject;
}

function getTime_CurriSec(currisec) {
    var time_CurriSec = []
    currisec.forEach(item => {
        time_CurriSec.push({ ...item, subject: [] })
    })
    return time_CurriSec;
}

function getPriority(subject_id) {
    if (subject_id === '01006010' || subject_id === '01006011' || subject_id === '01006015'
        || subject_id === '01006030' || subject_id === '01006031') {
        return 0;
    }
    else {
        return 1;
    }
}

timetable()

