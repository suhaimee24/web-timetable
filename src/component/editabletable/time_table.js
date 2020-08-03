/* eslint-disable no-unused-expressions */
// eslint-disable-next-line no-unused-expressions

// const axios = require('axios');
import axios from 'axios'
//Set Global variable
var time_CurriSec = [];
var uniqueSubject = [];
var StringResult = [];
var DataTimeTable = [];
var year
var semester
var token

async function timetable() {

    //Get Data from DataBase
    token = await axios.post("http://localhost:9000/API/login", {
        username: 'admin',
        password: '1234'
    })
    token = token.data;
    //console.log(token);

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

    var d = new Date();
    semester = 1
    year = d.getFullYear()
    if (d.getMonth() > 8 || d.getMonth() < 3) {
        semester = 2
    }

    let res = await axios.delete("http://localhost:9000/API/teach_table/", {
        data: {
            semester: semester,
            year: year
        },
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
    console.log(res.data);

    // Set Data before Calculate
    uniqueSubject = getUniqueSubject(SubSec);
    time_CurriSec = getTime_CurriSec(currisec);

    //Print for Check Data
    console.log('uniqueSubject ');
    console.log(uniqueSubject);
    //PrintTable(time_CurriSec);
    //console.log('time_CurriSec', time_CurriSec);
    console.log('');


    // Sort dy  priority
    uniqueSubject = uniqueSubject.sort(function (a, b) { return a.section_sum - b.section_sum });
    uniqueSubject = uniqueSubject.sort(function (a, b) { return getPriority(a.subject_id) - getPriority(b.subject_id) });
    uniqueSubject = SortuniqueSubject(uniqueSubject)
    console.log('uniqueSubject ');
    console.log(uniqueSubject);


    let DataNotime = [];
    //let result = TimeTableRe(0);
    for (let i = 0; i < uniqueSubject.length; i++) {
        //PrintTable(time_CurriSec)
        console.log('----------------------------------------------------------')
        console.log(' subject_id : ', uniqueSubject[i].subject_id)

        // find all Curri have to subject id
        let curri = currisub.filter(item => item.subject_id === uniqueSubject[i].subject_id && item.semester === 1)
        //console.log('curri',curri)

        // find all section in curri
        let DataCurriSec = [];
        curri.forEach(el => {
            let section = currisec.filter(item => item.curr2_id === el.curr2_id)
            section.forEach(item => {
                DataCurriSec.push(item)
            })
        })

        // Oder by priority number of section first
        DataCurriSec = DataCurriSec.sort(function (a, b) { return a.curr2_id - b.curr2_id });

        //console.log("DataCurriSec", DataCurriSec)
        //Print DataCurriSec
        // process.stdout.write(' DataCurriSec : ')
        // DataCurriSec.forEach(item => {
        //     process.stdout.write(item.curr2_section + ' ')
        // })
        // console.log("")
        console.log(" SumOfStudent : ", SumOfStudent(DataCurriSec))

        // get All Subject Section
        let DataSubjectSec = SubSec.filter(item => item.subject_id === uniqueSubject[i].subject_id && item.lect_or_prac === uniqueSubject[i].lect_or_prac)

        //Print DataSubjectSec
        // process.stdout.write(' DataSubjectSec : ')
        // DataSubjectSec.forEach(item => {
        //     process.stdout.write(item.subject_section + ' ')
        // })
        // console.log("")


        //Check before 
        if (DataCurriSec.length === 0) {
            console.log(`Subject_id ${uniqueSubject[i].subject_id} Do not have DataCurriSec`)
            StringResult.push(`Subject_id ${uniqueSubject[i].subject_id} Do not have DataCurriSec`)
            continue
        }

        // Set for prioty 0 '01006028'
        if (getPriority(uniqueSubject[i].subject_id) === 0) {
            //continue
            for (let j = 0; j < DataSubjectSec.length; j++) {
                console.log(`----DataSubjectSec ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section}----`)
                if (DataSubjectSec[j].teach_time === null) {
                    console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                        `to DataNotime`)

                    let temp = { SubjectSec: DataSubjectSec[j], CurriSec: DataCurriSec }
                    DataNotime.push(temp)
                    continue
                }
                for (let k = 0; k < DataCurriSec.length; k++) {
                    let time_CurriSec_index = time_CurriSec.findIndex(item => (DataCurriSec[k].curr2_section === item.curr2_section))
                    if (time_CurriSec_index > -1) {
                        time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSec[j])
                        console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                            `to curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
                    }
                }

            }
            continue
        }

        // Set for prioty 1 '01006010' '01006011' '01006030' '01006031'
        if (getPriority(uniqueSubject[i].subject_id) === 1) {
            for (let j = 0; j < DataSubjectSec.length; j++) {
                console.log(`----DataSubjectSec ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section}----`)

                let CurriSec_index = DataCurriSec.findIndex(item => (DataSubjectSec[j].subject_section === item.curr2_section))
                // Have Error
                if (CurriSec_index === -1) {
                    console.log(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} `
                        + `don't have curr2_section ${DataSubjectSec[j].subject_section} `)

                    StringResult.push(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} `
                        + `don't have curr2_section ${DataSubjectSec[j].subject_section} `)
                    continue
                }

                if (DataSubjectSec[j].teach_time === null) {
                    console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                        `to DataNotime `)

                    // Push to Data No time
                    let tempCurri = []
                    let tempSubject = []
                    tempCurri[0] = DataCurriSec.find(item => (DataSubjectSec[j].subject_section === item.curr2_section))
                    tempSubject[0] = DataSubjectSec[j]
                    let temp = { SubjectSec: tempSubject, CurriSec: tempCurri }
                    DataNotime.push(temp)
                    continue
                }

                let time_CurriSec_index = time_CurriSec.findIndex(item => (DataSubjectSec[j].subject_section === item.curr2_section))
                if (time_CurriSec_index > -1) {

                    let checkOverlay = false
                    //Check Overlay time Subject Section
                    time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                        if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {
                            console.log(item, 'Overlay', DataSubjectSec[j], 'in', time_CurriSec[time_CurriSec_index].curr2_section)
                            checkOverlay = true
                            return;
                        }
                    })
                    if (checkOverlay) {
                        console.log(`Subject_id ${uniqueSubject[i].subject_id} Section ${DataSubjectSec[j].subject_section} Overlay`)
                        StringResult.push(`Subject_id ${uniqueSubject[i].subject_id} Section ${DataSubjectSec[j].subject_section} Overlay`)
                        continue
                    }
                    time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSec[j])
                    console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                        `to curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
                }
            }
            continue
        }

        // Set for prioty 2 '01006015' 
        if (getPriority(uniqueSubject[i].subject_id) === 2) {
            if (uniqueSubject[i].lect_or_prac === 'l') {
                let DataSubjectSecP = SubSec.filter(item => item.subject_id === uniqueSubject[i].subject_id && item.lect_or_prac === "p");
                DataSubjectSec = DataSubjectSec.sort(function (a, b) { return a.subject_section - b.subject_section });
                DataSubjectSecP = DataSubjectSecP.sort(function (a, b) { return a.subject_section - b.subject_section });
                for (let j = 0; j < DataSubjectSec.length; j++) {
                    console.log(`----DataSubjectSec ${DataSubjectSec[j].subject_id} Section L ${DataSubjectSec[j].subject_section} `)
                    console.log(`----DataSubjectSec ${DataSubjectSecP[j].subject_id} Section P ${DataSubjectSecP[j].subject_section} `)

                    let CurriSec_index = DataCurriSec.findIndex(item => (DataSubjectSec[j].subject_section === item.curr2_section))
                    // Have Error
                    if (CurriSec_index === -1) {
                        console.log(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} `
                            + `don't have curr2_section ${DataSubjectSec[j].subject_section} `)

                        StringResult.push(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} `
                            + `don't have curr2_section ${DataSubjectSec[j].subject_section} `)
                        continue
                    }
                    if (DataSubjectSec[j].teach_time === null) {
                        console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                            `to DataNotime `)

                        // Push to Data No time
                        let tempCurri = []
                        let tempSubject = []
                        tempCurri[0] = DataCurriSec.find(item => (DataSubjectSec[j].subject_section === item.curr2_section))
                        tempSubject[0] = DataSubjectSec[j]
                        tempSubject[1] = DataSubjectSecP[j]
                        let temp = { SubjectSec: tempSubject, CurriSec: tempCurri }
                        DataNotime.push(temp)
                        continue
                    }

                    let time_CurriSec_index = time_CurriSec.findIndex(item => (DataSubjectSec[j].subject_section === item.curr2_section))
                    if (time_CurriSec_index > -1) {
                        let checkOverlay = false
                        //Check Overlay time Subject Section
                        time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                            if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {
                                console.log(item, 'Overlay', DataSubjectSec[j], 'in', time_CurriSec[time_CurriSec_index].curr2_section)
                                checkOverlay = true
                                return;
                            }

                        })
                        if (checkOverlay) {
                            console.log(`Subject_id ${uniqueSubject[i].subject_id} Section ${DataSubjectSec[j].subject_section} Overlay`)
                            StringResult.push(`Subject_id ${uniqueSubject[i].subject_id} Section ${DataSubjectSec[j].subject_section} Overlay`)
                            continue
                        }

                        time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSec[j])
                        time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSecP[j])
                        console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                            `to curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
                    }
                }
            }
            continue
        }

        // Set for prioty 3 '01006021' '01006023' '01006025'
        if (getPriority(uniqueSubject[i].subject_id) === 3) {

            let runAllpath = false
            let NotFindPath = false

            let DataCurriSec2 = DataCurriSec

            let averageCurriSec = parseInt(DataCurriSec.length / (DataSubjectSec.length))
            let avergeStudent = parseInt(SumOfStudent(DataCurriSec) / (DataSubjectSec.length))
            let levelCurriSec = 2
            let levelStudent = 30
            console.log(' averageCurriSec : ', averageCurriSec)
            console.log(' avergeStudent : ', avergeStudent)
            // console.log(SumOfStudent(DataCurriSec))
            avergeStudent = 140
            if (uniqueSubject[i].subject_id === '01006025') {
                avergeStudent = 110
                levelStudent = 15
            }
            DataCurriSec = DataCurriSec.sort(function (a, b) { return b.curr2_section_student_amount - a.curr2_section_student_amount });

            let OldPathCurriSection = [];
            let SelectPathCurriSection = [];
            let lastindex_j = 0
            for (let j = 0; j < DataSubjectSec.length; j++) {
                if (runAllpath) {
                    break
                }

                let TempDataCheck = []
                if (DataSubjectSec[j].teach_time !== null) {
                    for (let k = 0; k < DataCurriSec2.length; k++) {
                        let checkOverlay = false
                        let time_CurriSec_index = time_CurriSec.findIndex(item => (DataCurriSec2[k].curr2_section === item.curr2_section))
                        //Check Overlay time Subject Section
                        time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                            if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {
                                checkOverlay = true
                                return;
                            }
                        })
                        if (!checkOverlay) {
                            TempDataCheck.push(DataCurriSec2[k].curr2_section)
                        }
                    }
                }
                else {
                    for (let k = 0; k < DataCurriSec2.length; k++) {
                        TempDataCheck.push(DataCurriSec2[k].curr2_section)
                    }

                }

                // Find path 
                let last = false
                if (j === DataSubjectSec.length - 1) {
                    last = true
                }
                PathCurriSection = [];
                findPathSection(DataCurriSec, averageCurriSec + levelCurriSec, averageCurriSec - levelCurriSec,
                    avergeStudent, avergeStudent - (levelStudent * levelCurriSec), last)
                PathCurriSection = PathCurriSection.sort(function (a, b) { return b.student_sum - a.student_sum });
                PathCurriSection = PathCurriSection.sort(function (a, b) { return b.section_sum - a.section_sum });
                // console.log('PathCurriSection', PathCurriSection)

                if (PathCurriSection.length === 0 && DataCurriSec.length === 0) {
                    console.log(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} don't have path`)
                    StringResult.push(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} don't have path`)
                    SelectPathCurriSection[j] = undefined
                    continue
                }

                for (let k = 0; k < OldPathCurriSection.length; k++) {

                    if (OldPathCurriSection[k].index_j === j) {
                        let Index = []
                        PathCurriSection.forEach(item => {
                            let check = 0
                            for (let l = 0; l < item.path.length; l++) {
                                for (let m = 0; m < OldPathCurriSection[k].path.length; m++) {
                                    if (item.path[l] === OldPathCurriSection[k].path[m]) {
                                        check++
                                    }
                                }
                            }
                            if (check === item.path.length && check === OldPathCurriSection[k].path.length) {
                                Index = item;
                            }
                        });
                        PathCurriSection = PathCurriSection.filter(item => item !== Index)
                    }
                }
                if (PathCurriSection.length === 0) {
                    let lastOldPathCurriSection = []
                    OldPathCurriSection.forEach(item => {
                        if (item.index_j === j - 1) {
                            lastOldPathCurriSection = item;
                        }
                    });
                    if (lastOldPathCurriSection.length === 0) {
                        console.log(`End Subject_id ${DataSubjectSec[j].subject_id} Can not Put Any path `)
                        StringResult.push(`End Subject_id ${DataSubjectSec[j].subject_id} Can not Put Any path `)
                        SelectPathCurriSection = []
                        runAllpath = true
                        NotFindPath = true
                        j = j - 2
                        break
                    }
                    OldPathCurriSection = OldPathCurriSection.filter(item => (item.index_j < j))
                    for (let k = 0; k < lastOldPathCurriSection.tempDataCurriSec.length; k++) {
                        let temp = lastOldPathCurriSection.tempDataCurriSec[k]
                        // Change Array To Json
                        temp = temp[0]
                        DataCurriSec.push(temp)
                    }
                    j = j - 2
                    continue

                }
                //Loop for Find path is not overlay 
                while (true) {
                    // Find Min Path 
                    let AbsMinSection = averageCurriSec
                    let AbsMinStudent = avergeStudent
                    let MinSection = averageCurriSec
                    let MinStudent = avergeStudent
                    let PathTemp = []
                    let TempItem = []
                    PathCurriSection.forEach(item => {
                        if (AbsMinSection >= Math.abs(item.section_sum - averageCurriSec)
                            && AbsMinStudent >= Math.abs(item.student_sum - avergeStudent)) {
                            AbsMinSection = Math.abs(item.section_sum - averageCurriSec)
                            AbsMinStudent = Math.abs(item.student_sum - avergeStudent)
                            MinSection = item.section_sum - averageCurriSec
                            MinStudent = item.student_sum - avergeStudent
                            PathTemp = item.path
                            TempItem = item
                        }
                    })

                    if (AbsMinSection === averageCurriSec && AbsMinStudent === avergeStudent) {
                        let lastOldPathCurriSection = []
                        OldPathCurriSection.forEach(item => {
                            if (item.index_j === j - 1) {
                                lastOldPathCurriSection = item;
                            }
                        });
                        if (lastOldPathCurriSection.length === 0) {
                            console.log(`Subject_id ${DataSubjectSec[j].subject_id} Can not Put Any path `)
                            StringResult.push(`Subject_id ${DataSubjectSec[j].subject_id} Can not Put Any path `)
                            SelectPathCurriSection = []
                            runAllpath = true
                            NotFindPath = true
                            j = j - 2
                            break
                        }
                        for (let k = 0; k < lastOldPathCurriSection.tempDataCurriSec.length; k++) {
                            let temp = lastOldPathCurriSection.tempDataCurriSec[k]
                            // Change Array To Json
                            temp = temp[0]
                            DataCurriSec.push(temp)
                        }
                        j = j - 2
                        break
                    }
                    if (DataSubjectSec[j].teach_time === null) {
                        let tempDataCurriSec = []
                        for (let k = 0; k < PathTemp.length; k++) {
                            tempDataCurriSec.push(DataCurriSec.filter(item => item.curr2_section === PathTemp[k]))
                            DataCurriSec = DataCurriSec.filter(item => item.curr2_section !== PathTemp[k])
                        }
                        OldPathCurriSection.push({ index_j: j, path: PathTemp, tempDataCurriSec: tempDataCurriSec })
                        SelectPathCurriSection[j] = PathTemp
                        break
                    }
                    let checkOverlay = false
                    let checkOverlayWithPrioty0 = false
                    for (let k = 0; k < PathTemp.length; k++) {
                        let time_CurriSec_index = time_CurriSec.findIndex(item => (PathTemp[k] === item.curr2_section))
                        //Check Overlay time Subject Section
                        time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                            if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {
                                if (getPriority(item.subject_id) === 0) {
                                    checkOverlayWithPrioty0 = true
                                }
                                checkOverlay = true
                                return;
                            }
                        })
                        if (checkOverlay) {
                            break
                        }
                    }
                    if (checkOverlayWithPrioty0) {
                        console.log(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} OverlayWithPrioty 0`)
                        StringResult.push(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} OverlayWithPrioty 0`)
                        break
                    }
                    if (!checkOverlay) {
                        let tempDataCurriSec = []
                        for (let k = 0; k < PathTemp.length; k++) {
                            tempDataCurriSec.push(DataCurriSec.filter(item => item.curr2_section === PathTemp[k]))
                            DataCurriSec = DataCurriSec.filter(item => item.curr2_section !== PathTemp[k])
                        }
                        OldPathCurriSection.push({ index_j: j, path: PathTemp, tempDataCurriSec: tempDataCurriSec })
                        SelectPathCurriSection[j] = PathTemp
                        lastindex_j = j
                        break
                    }

                    PathCurriSection = PathCurriSection.filter(item => item !== TempItem)
                }

            }
            if (NotFindPath) {
                continue
            }
            for (let j = 0; j < DataSubjectSec.length; j++) {
                let PathTemp = SelectPathCurriSection[j]
                let tempCurri = []
                let tempSubject = []
                tempSubject[0] = DataSubjectSec[j]
                if (PathTemp === undefined) {
                    console.log(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} don't have SelectPathCurriSection[j]`)
                    StringResult.push(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} don't have SelectPathCurriSection[j]`)
                    continue
                }
                for (let k = 0; k < PathTemp.length; k++) {
                    let temp = DataCurriSec2.find(item => (PathTemp[k] === item.curr2_section))
                    tempCurri.push(temp)
                }

                if (DataSubjectSec[j].teach_time === null) {
                    // console.log(tempCurri)
                    let temp = { SubjectSec: tempSubject, CurriSec: tempCurri }
                    DataNotime.push(temp)
                    continue
                }
                for (let k = 0; k < tempCurri.length; k++) {
                    let time_CurriSec_index = time_CurriSec.findIndex(item => (tempCurri[k].curr2_section === item.curr2_section))
                    console.log(time_CurriSec_index,)
                    if (time_CurriSec_index > -1) {
                        time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSec[j])
                    }
                }
            }
            continue
        }

        // Set for prioty 4 '01006020' '01006022' '01006024'
        if (getPriority(uniqueSubject[i].subject_id) === 4) {

            // continue

            let runAllpath = false
            let UniqueCurri = getUniqueCurri(DataCurriSec)
            let UniqueCurri2 = UniqueCurri
            let DataCurriSec2 = DataCurriSec
            let NotFindPath = false

            let averageCurriSec = parseInt(DataCurriSec.length / (DataSubjectSec.length))
            let avergeStudent = parseInt(SumOfStudent(DataCurriSec) / (DataSubjectSec.length))
            let levelStudent = 45
            let levelCurriSec = 2
            console.log(' averageCurriSec : ', averageCurriSec)
            console.log(' avergeStudent : ', avergeStudent)
            // console.log(SumOfStudent(DataCurriSec))


            // if (uniqueSubject[i].subject_id === '01006024') {
            //     averageCurriSec = 140
            //     console.log(' set averageCurriSec : ', averageCurriSec)
            // }
            let min = DataCurriSec.length
            let max = 0
            UniqueCurri.forEach(item => {
                if (item.section_sum <= min)
                    min = item.section_sum
                if (item.section_sum >= max)
                    max = item.section_sum
            })
            let OldPathCurriID = [];
            let SelectPathCurriID = [];
            let checkOverlay = false
            for (let j = 0; j < DataSubjectSec.length; j++) {
                if (runAllpath) {
                    break
                }

                let TempDataCheck = []
                if (DataSubjectSec[j].teach_time !== null) {
                    for (let k = 0; k < DataCurriSec.length; k++) {
                        checkOverlay = false
                        let time_CurriSec_index = time_CurriSec.findIndex(item => (DataCurriSec[k].curr2_section === item.curr2_section))
                        //Check Overlay time Subject Section
                        time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                            if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {
                                checkOverlay = true
                                return;
                            }
                        })
                        if (!checkOverlay) {
                            TempDataCheck.push(DataCurriSec[k].curr2_section)
                        }
                    }
                }
                else {
                    for (let k = 0; k < DataCurriSec.length; k++) {
                        TempDataCheck.push(DataCurriSec[k].curr2_section)
                    }

                }

                let DataCurriSecTemp = []
                if (DataSubjectSec[j].teach_time !== null) {
                    for (let k = 0; k < DataCurriSec2.length; k++) {
                        checkOverlay = false
                        let time_CurriSec_index = time_CurriSec.findIndex(item => (DataCurriSec2[k].curr2_section === item.curr2_section))
                        //Check Overlay time Subject Section
                        time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                            if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {
                                checkOverlay = true
                                return;
                            }
                        })
                        if (!checkOverlay) {
                            DataCurriSecTemp.push(DataCurriSec2[k])
                        }
                    }
                }
                else {
                    for (let k = 0; k < DataCurriSec2.length; k++) {
                        DataCurriSecTemp.push(DataCurriSec2[k])
                    }

                }

                UniqueCurri = getUniqueCurri(DataCurriSecTemp)

                // Find path 
                let last = false
                if (j === DataSubjectSec.length - 1) {
                    last = true
                }
                PathCurriID = [];
                findPath(UniqueCurri, parseInt(averageCurriSec / min), parseInt(averageCurriSec / max),
                    averageCurriSec + levelCurriSec, avergeStudent + (levelStudent * (levelCurriSec - 1)), averageCurriSec - levelCurriSec, avergeStudent - (levelStudent * levelCurriSec), last)
                PathCurriID = PathCurriID.sort(function (a, b) { return b.student_sum - a.student_sum });
                PathCurriID = PathCurriID.sort(function (a, b) { return b.section_sum - a.section_sum });

                if (PathCurriID.length === [] || DataCurriSec2.length === 0) {
                    console.log(`End Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} don't have path`)
                    StringResult.push(`End Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} don't have path`)
                    SelectPathCurriID[j] = undefined
                    continue
                }

                //Delete Old path like Recursive Function
                for (let k = 0; k < OldPathCurriID.length; k++) {
                    if (OldPathCurriID[k].index_j === j) {
                        let Index = []
                        PathCurriID.forEach(item => {
                            let check = 0
                            let CheckSec = 0
                            for (let l = 0; l < item.path.length; l++) {
                                let IdInpath = item.path[l]
                                let SecInID = UniqueCurri.filter(item => (item.curr2_id === IdInpath))
                                if (SecInID.length === []) {
                                    break
                                }
                                //convert to json
                                SecInID = SecInID[0]
                                for (let n = 0; n < SecInID.section.length; n++) {
                                    for (let m = 0; m < OldPathCurriID[k].tempCurriSection.length; m++) {
                                        let tempOPCS = OldPathCurriID[k].tempCurriSection[m]
                                        //convert to json
                                        tempOPCS = tempOPCS[0]
                                        if (SecInID.section[n] === tempOPCS.curr2_section) {
                                            check++
                                        }
                                    }
                                    CheckSec += 1
                                }
                            }
                            if (check === CheckSec && check != 0) {
                                Index = item;
                            }
                        });
                        PathCurriID = PathCurriID.filter(item => item !== Index)
                    }
                }
                if (PathCurriID.length === 0 && j === 0) {
                    console.log(`End Subject_id ${DataSubjectSec[j].subject_id} Can not Put Any path `)
                    StringResult.push(`End Subject_id ${DataSubjectSec[j].subject_id} Can not Put Any path `)
                    NotFindPath = true
                    SelectPathCurriID = []
                    break
                }
                //console.log("PathCurriID  After Oldpath ", PathCurriID)
                if (PathCurriID.length === 0) {
                    let lastOldPathCurriID = []
                    OldPathCurriID.forEach(item => {
                        if (item.index_j === j - 1) {
                            lastOldPathCurriID = item;
                        }
                    });
                    if (lastOldPathCurriID.length === []) {
                        console.log(`End Subject_id ${DataSubjectSec[j].subject_id} Can not Put Any path `)
                        StringResult.push(`End Subject_id ${DataSubjectSec[j].subject_id} Can not Put Any path `)
                        SelectPathCurriID = []
                        NotFindPath = true
                        break
                    }
                    OldPathCurriID = OldPathCurriID.filter(item => (item.index_j < j))
                    for (let k = 0; k < lastOldPathCurriID.tempCurriSection.length; k++) {
                        let temp = lastOldPathCurriID.tempCurriSection[k]
                        // Change Array To Json
                        temp = temp[0]

                        DataCurriSec2.push(temp)
                    }
                    j = j - 2
                    continue
                }
                //Loop for Find path is not overlay 
                while (true) {
                    // Find Min Path 
                    let AbsMinSection = averageCurriSec
                    let AbsMinStudent = avergeStudent
                    let MinSection = averageCurriSec
                    let MinStudent = avergeStudent
                    let PathTemp = []
                    let TempItem = []
                    PathCurriID.forEach(item => {
                        if (AbsMinSection >= Math.abs(item.section_sum - averageCurriSec)
                            && AbsMinStudent >= Math.abs(item.student_sum - avergeStudent)) {
                            AbsMinSection = Math.abs(item.section_sum - averageCurriSec)
                            AbsMinStudent = Math.abs(item.student_sum - avergeStudent)
                            MinSection = item.section_sum - averageCurriSec
                            MinStudent = item.student_sum - avergeStudent
                            PathTemp = item.path
                            TempItem = item
                        }
                    })
                    if (AbsMinSection === averageCurriSec && AbsMinStudent === avergeStudent) {
                        let lastOldPathCurriID = []
                        OldPathCurriID.forEach(item => {
                            if (item.index_j === j - 1) {
                                lastOldPathCurriID = item;
                            }
                        });
                        if (lastOldPathCurriID === []) {
                            console.log(`End Subject_id ${DataSubjectSec[j].subject_id} Can not Put Any path `)
                            StringResult.push(`End Subject_id ${DataSubjectSec[j].subject_id} Can not Put Any path `)
                            SelectPathCurriID = []
                            runAllpath = true
                            NotFindPath = true
                            j = j - 2
                            break
                        }
                        for (let k = 0; k < lastOldPathCurriID.tempCurriSection.length; k++) {
                            let temp = lastOldPathCurriID.tempCurriSection[k]
                            // Change Array To Json
                            temp = temp[0]
                            DataCurriSec2.push(temp)
                        }
                        j = j - 2
                        break
                    }

                    if (DataSubjectSec[j].teach_time === null) {
                        let tempUniqueCurri = []
                        for (let k = 0; k < PathTemp.length; k++) {
                            tempUniqueCurri.push(UniqueCurri.filter(item => item.curr2_id === PathTemp[k]))
                            UniqueCurri = UniqueCurri.filter(item => item.curr2_id !== PathTemp[k])
                        }
                        OldPathCurriID.push({ index_j: j, path: PathTemp, tempUniqueCurri: tempUniqueCurri })
                        SelectPathCurriID[j] = PathTemp
                        break
                    }
                    let checkOverlay = false
                    for (let k = 0; k < PathTemp.length; k++) {
                        let UniqueCurri_index = UniqueCurri.findIndex(item => (PathTemp[k] === item.curr2_id))
                        for (let l = 0; l < UniqueCurri[UniqueCurri_index].section.length; l++) {
                            let time_CurriSec_index = time_CurriSec.findIndex(item =>
                                (UniqueCurri[UniqueCurri_index].section[l] === item.curr2_section))
                            //Check Overlay time Subject Section
                            time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                                if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {
                                    checkOverlay = true
                                    return;
                                }
                            })
                            if (checkOverlay) {
                                break
                            }
                        }
                        if (checkOverlay) {
                            break
                        }
                    }

                    if (!checkOverlay) {
                        let tempCurriSection = []
                        for (let k = 0; k < PathTemp.length; k++) {
                            let UniqueCurritemp = UniqueCurri.filter(item => item.curr2_id === PathTemp[k])
                            //conver to json
                            UniqueCurritemp = UniqueCurritemp[0]
                            for (let l = 0; l < UniqueCurritemp.section.length; l++) {
                                tempCurriSection.push(DataCurriSec2.filter(item => item.curr2_section === UniqueCurritemp.section[l]))
                                DataCurriSec2 = DataCurriSec2.filter(item => item.curr2_section !== UniqueCurritemp.section[l])

                            }

                        }
                        OldPathCurriID.push({ index_j: j, path: PathTemp, tempCurriSection: tempCurriSection })
                        SelectPathCurriID[j] = tempCurriSection
                        if (j === DataSubjectSec.length - 1 && DataCurriSec2.length > 0) {
                            let lastOldPathCurriID = []
                            OldPathCurriID.forEach(item => {
                                if (item.index_j === j) {
                                    lastOldPathCurriID = item;
                                }
                            });
                            for (let k = 0; k < lastOldPathCurriID.tempCurriSection.length; k++) {
                                let temp = lastOldPathCurriID.tempCurriSection[k]
                                // Change Array To Json
                                temp = temp[0]
                                DataCurriSec2.push(temp)
                            }
                            j = j - 2
                        }
                        break
                    }
                    PathCurriID = PathCurriID.filter(item => item !== TempItem)
                }

            }
            if (NotFindPath) {
                continue
            }
            for (let j = 0; j < DataSubjectSec.length; j++) {
                let PathTemp = SelectPathCurriID[j]
                let tempCurri = []
                let tempSubject = []
                tempSubject[0] = DataSubjectSec[j]
                if (PathTemp === undefined) {
                    console.log(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} don't have SelectPathCurriID[j]`)
                    StringResult.push(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} don't have SelectPathCurriID[j]`)
                    continue
                }
                for (let k = 0; k < PathTemp.length; k++) {
                    let tempK = PathTemp[k]
                    //convert to json
                    tempK = tempK[0]
                    let temp = DataCurriSec.find(item => (tempK.curr2_section === item.curr2_section))
                    tempCurri.push(temp)
                }
                if (DataSubjectSec[j].teach_time === null) {
                    let temp = { SubjectSec: tempSubject, CurriSec: tempCurri }
                    DataNotime.push(temp)
                    continue
                }
                for (let k = 0; k < tempCurri.length; k++) {
                    let time_CurriSec_index = time_CurriSec.findIndex(item =>
                        (tempCurri[k].curr2_section === item.curr2_section))
                    if (time_CurriSec_index > -1) {
                        time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSec[j])
                    }
                }
            }
            continue
        }

        // Set for prioty 5 '01006012'
        if (getPriority(uniqueSubject[i].subject_id) === 5) {

            // continue
            if (uniqueSubject[i].lect_or_prac === 'l') {
                let DataSubjectSecP = SubSec.filter(item => item.subject_id === uniqueSubject[i].subject_id && item.lect_or_prac === "p");
                DataSubjectSec = DataSubjectSec.sort(function (a, b) { return a.subject_section - b.subject_section });
                DataSubjectSecP = DataSubjectSecP.sort(function (a, b) { return a.subject_section - b.subject_section });

                let MaxAmount = 40
                let LevelAmount = 10
                let DataCurriSecTemp = DataCurriSec.sort(function (a, b) { return b.curr2_section_student_amount - a.curr2_section_student_amount });
                // DataCurriSecTemp = DataCurriSecTemp.sort(function (a, b) { return b.curr2_section_student_amount - a.curr2_section_student_amount });
                // DataCurriSecTemp = DataCurriSecTemp.sort(function (a, b) { return a.curr2_section_student_amount - b.curr2_section_student_amount });
                // DataCurriSecTemp = DataCurriSec.sort(function (a, b) { return a.curr2_id - b.curr2_id });

                let OldPathCurriSec = [];
                let SelectPathCurriSec = [];
                let AmountPerSec = [];
                let checkOverlay = false
                for (let j = 0; j < DataSubjectSec.length; j++) {
                    AmountPerSec.push({ amount: 0, curr2_section: [] })
                }
                for (let j = 0; j < DataSubjectSec.length; j++) {
                    if (j >= DataSubjectSecP.length) {
                        console.log(`Subject_id ${uniqueSubject[i].subject_id} P less than Subject_id ${uniqueSubject[i].subject_id} L`)
                        StringResult.push(`Subject_id ${uniqueSubject[i].subject_id} P less than Subject_id ${uniqueSubject[i].subject_id} L`)
                        break
                    }
                    console.log(`----DataSubjectSec ${DataSubjectSec[j].subject_id} Section L ${DataSubjectSec[j].subject_section}----`)
                    console.log(`----DataSubjectSec ${DataSubjectSecP[j].subject_id} Section P ${DataSubjectSecP[j].subject_section}----`)

                    //console.log('DataCurriSecTemp', DataCurriSecTemp)
                    let TempDataCheck = []
                    if (DataSubjectSec[j].teach_time !== null) {
                        for (let k = 0; k < DataCurriSecTemp.length; k++) {
                            checkOverlay = false
                            let time_CurriSec_index = time_CurriSec.findIndex(item => (DataCurriSecTemp[k].curr2_section === item.curr2_section))

                            time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                                if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {

                                    checkOverlay = true
                                    return;
                                }
                                if (CheckTimeOverlay(item, DataSubjectSecP[j]) === -1) {
                                    checkOverlay = true
                                    return;
                                }
                            })
                            if (!checkOverlay) {
                                TempDataCheck.push(DataCurriSecTemp[k].curr2_section)
                            }
                        }
                    }
                    else {
                        for (let k = 0; k < DataCurriSecTemp.length; k++) {
                            TempDataCheck.push(DataCurriSecTemp[k].curr2_section)
                        }

                    }
                    console.log(TempDataCheck)

                    if (DataCurriSecTemp.length === 0) {
                        console.log(`Subject_id ${uniqueSubject[i].subject_id} Section ${uniqueSubject[i].subject_section} Do not have DataCurriSec`)
                        StringResult.push(`Subject_id ${uniqueSubject[i].subject_id} Section ${uniqueSubject[i].subject_section} Do not have DataCurriSec`)
                        continue
                    }
                    let isAll = true
                    if (AmountPerSec[j].amount !== 0) {
                        let index_temp = TempDataCheck.findIndex(item => (item === AmountPerSec[j].curr2_section[0].curr2_section))
                        if (index_temp === -1) {

                            let index_ = DataCurriSecTemp.findIndex(item => (item.curr2_section === AmountPerSec[j].curr2_section[0].curr2_section))
                            if (index_ > -1) {
                                DataCurriSecTemp[index_].curr2_section_student_amount += AmountPerSec[j].amount
                                AmountPerSec[j].amount = 0
                                AmountPerSec[j].curr2_section = []
                            }
                        }
                    }
                    for (let k = 0; k < DataCurriSecTemp.length; k++) {
                        //console.log('DataCurriSecTemp', DataCurriSecTemp[k])

                        if (DataCurriSecTemp[k].curr2_section_student_amount === 0) {
                            continue
                        }
                        checkOverlay = false
                        if (DataSubjectSec[j].teach_time !== null) {
                            let time_CurriSec_index = time_CurriSec.findIndex(item => (DataCurriSecTemp[k].curr2_section === item.curr2_section))
                            //Check Overlay time Subject Section
                            time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                                if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {
                                    checkOverlay = true
                                    return;
                                }
                                if (CheckTimeOverlay(item, DataSubjectSecP[j]) === -1) {
                                    checkOverlay = true
                                    return;
                                }
                            })
                            if (checkOverlay) {
                                continue
                            }
                        }
                        if (AmountPerSec[j].amount === 0) {
                            isAll = false
                            let curr2_section = DataCurriSecTemp[k].curr2_section
                            if (DataCurriSecTemp[k].curr2_section_student_amount >= MaxAmount - LevelAmount) {

                                if (DataCurriSecTemp[k].curr2_section_student_amount > MaxAmount) {
                                    AmountPerSec[j].amount = MaxAmount
                                    AmountPerSec[j].curr2_section.push({ curr2_section })
                                    DataCurriSecTemp[k].curr2_section_student_amount -= MaxAmount
                                    SelectPathCurriSec[j] = AmountPerSec[j].curr2_section
                                    if (j + 1 < DataSubjectSec.length && DataCurriSecTemp[k].curr2_section_student_amount <= MaxAmount) {
                                        AmountPerSec[j + 1].amount = DataCurriSecTemp[k].curr2_section_student_amount
                                        AmountPerSec[j + 1].curr2_section.push({ curr2_section })
                                        DataCurriSecTemp[k].curr2_section_student_amount = 0
                                    }
                                    break
                                }
                                AmountPerSec[j].amount = DataCurriSecTemp[k].curr2_section_student_amount
                                AmountPerSec[j].curr2_section.push({ curr2_section })
                                DataCurriSecTemp[k].curr2_section_student_amount = 0
                                SelectPathCurriSec[j] = AmountPerSec[j].curr2_section
                                break
                            }
                            AmountPerSec[j].amount = DataCurriSecTemp[k].curr2_section_student_amount
                            AmountPerSec[j].curr2_section.push({ curr2_section })
                            DataCurriSecTemp[k].curr2_section_student_amount = 0
                        }

                        if (AmountPerSec[j].amount >= MaxAmount - LevelAmount && AmountPerSec[j].amount <= MaxAmount) {
                            isAll = false
                           
                            SelectPathCurriSec[j] = AmountPerSec[j].curr2_section
                            break
                        }

                        if (AmountPerSec[j].amount + DataCurriSecTemp[k].curr2_section_student_amount >= MaxAmount - LevelAmount) {
                            isAll = false
                            
                            let curr2_section = DataCurriSecTemp[k].curr2_section
                            DataCurriSecTemp[k].curr2_section_student_amount -= (MaxAmount - AmountPerSec[j].amount)
                            AmountPerSec[j].amount = MaxAmount
                            AmountPerSec[j].curr2_section.push({ curr2_section })
                            SelectPathCurriSec[j] = AmountPerSec[j].curr2_section
                            if (j + 1 < DataSubjectSec.length && DataCurriSecTemp[k].curr2_section_student_amount <= MaxAmount) {
                                AmountPerSec[j + 1].amount = DataCurriSecTemp[k].curr2_section_student_amount
                                AmountPerSec[j + 1].curr2_section.push({ curr2_section })
                                DataCurriSecTemp[k].curr2_section_student_amount = 0
                            }
                            break
                        }
                    }

                    if (checkOverlay) {
                        AmountPerSec[j + 1] = AmountPerSec[j]
                        if (AmountPerSec[j].amount !== 0) {
                            // console.log('test AmountPerSec[j].curr2_section ', AmountPerSec[j].curr2_section[0].curr2_section)
                            // let index_DataCurriSec = DataCurriSecTemp.findIndex(item => { item.curr2_section === AmountPerSec[j].curr2_section[0] })
                            // if (index_DataCurriSec > -1) {

                            // }
                        }
                        continue
                    }
                    if (isAll && AmountPerSec[j].amount > 0 && !checkOverlay) {
                        SelectPathCurriSec[j] = AmountPerSec[j].curr2_section

                    }

                }

                let isNotEmpty = false
                let temCsec = []
                for (let k = 0; k < DataCurriSecTemp.length; k++) {
                    if (DataCurriSecTemp[k].curr2_section_student_amount > 0) {
                        isNotEmpty = true
                        temCsec.push(DataCurriSecTemp[k].curr2_section)
                    }
                }
                if (isNotEmpty) {
                    console.log(`Subject_id ${uniqueSubject[i].subject_id} Have Section Not in Subject ${temCsec} `)
                    StringResult.push(`Subject_id ${uniqueSubject[i].subject_id} Have Section Not in Subject ${temCsec} `)
                }
                console.log('SelectPathCurriSec')
                for (let j = 0; j < DataSubjectSec.length; j++) {
                    console.log(`----DataSubjectSec ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section}----`)
                    let tempCurri = []
                    let temp = SelectPathCurriSec[j]
                    if (temp === undefined) {
                        console.log(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} don't have SelectPathCurriSec[j]`)
                        StringResult.push(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} don't have SelectPathCurriSec[j]`)
                        continue
                    }
                    //console.log('temp ',temp)
                    for (let k = 0; k < temp.length; k++) {
                        //console.log('temp[k].curr2_section ',temp[k].curr2_section)
                        tempCurri.push(DataCurriSec.find(item => (item.curr2_section === temp[k].curr2_section)))
                    }

                    if (DataSubjectSec[j].teach_time === null) {
                        let tempSubject = []
                        tempSubject[0] = DataSubjectSec[j]
                        tempSubject[1] = DataSubjectSecP[j]
                        console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                            `to DataNotime`)
                        let temp = { SubjectSec: tempSubject, CurriSec: tempCurri }
                        DataNotime.push(temp)
                        continue
                    }

                    for (let k = 0; k < tempCurri.length; k++) {
                        let time_CurriSec_index = time_CurriSec.findIndex(item =>
                            (tempCurri[k].curr2_section === item.curr2_section))
                        if (time_CurriSec_index > -1) {
                            time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSec[j])
                            time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSecP[j])
                            console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                                `to curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
                        }
                    }
                }
            }
            continue
        }

    }

    DataNotime = DataNotime.sort(function (a, b) { return b.SubjectSec[0].subject_id - a.SubjectSec[0].subject_id });

    DataNotime = DataNotimeSort(DataNotime)
    console.log('----DataNotime -----')
    for (let i = 0; i < DataNotime.length; i++) {
        let SubjectSec = DataNotime[i].SubjectSec
        let CurriSec = DataNotime[i].CurriSec
        for (let j = 0; j < SubjectSec.length; j++) {
            console.log(`subject_id ${SubjectSec[j].subject_id} Section ${SubjectSec[j].subject_section} `)
        }
        let TimeSlot = findTimeSlot(DataNotime[i])
        if (TimeSlot.length > 0) {
            for (let j = 0; j < SubjectSec.length; j++) {
                SubjectSec[j].teach_day = TimeSlot[j].teach_day
                SubjectSec[j].teach_time = TimeSlot[j].teach_time
                SubjectSec[j].teach_time2 = TimeSlot[j].teach_time2
            }
            for (let j = 0; j < CurriSec.length; j++) {
                let time_CurriSec_index = time_CurriSec.findIndex(item => (CurriSec[j].curr2_section === item.curr2_section))
                time_CurriSec[time_CurriSec_index].subject.push(SubjectSec[0])
                if (SubjectSec.length === 2) {
                    time_CurriSec[time_CurriSec_index].subject.push(SubjectSec[1])
                }
                console.log(` => Add ${SubjectSec[0].subject_id} Section ${SubjectSec[0].subject_section} ` +
                    `to curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
            }

        }


    }
    console.log('')
    console.log('---------------StringResult---------------')
    for (let i = 0; i < StringResult.length; i++) {
        console.log(StringResult[i])
    }
    console.log('')


    //PrintTable(time_CurriSec)
    AddDataTimeTable(time_CurriSec)
    //PrintDataTimeTable(uniqueSubject)

    return { DataTimeTable: DataTimeTable, StringResult: StringResult }
}




//Set Global variable 
var tempData = [];
var PathCurriSection = [];

function findPathSection(data, max, min, student_break, student_break2, last) {
    if (last) {
        findPathSectionRe(data, data.length, 0, 0, [], student_break, student_break2)
    }
    else {
        if (min < 1) {
            min = 1
        }
        for (let i = max; i >= min; i--) {
            findPathSectionRe(data, i, 0, 0, [], student_break, student_break2)
        }
    }
}

function findPathSectionRe(tempdata, num, section_sum, student_sum, path, student_break, student_break2) {
    if (num === 0) {
        if (student_sum > student_break || student_sum < student_break2) {
            return
        }
        let datatemp = PathCurriSection.filter(item => item.section_sum === section_sum && item.student_sum === student_sum);
        if (datatemp.length > 0) {
            for (let k = 0; k < datatemp.length; k++) {
                if (datatemp[k].path.length === path.length) {
                    let check = 0;
                    datatemp[k].path = datatemp[k].path.sort()
                    path = path.sort()
                    for (let i = 0; i < datatemp[k].path.length; i++) {
                        for (let j = 0; j < path.length; j++) {
                            if (datatemp[k].path[i] === path[j]) {
                                check++;
                                break;
                            }
                        }
                    }
                    if (check === datatemp[k].path.length) {
                        return
                    }
                }
            }
        }
        PathCurriSection.push({ section_sum: section_sum, student_sum: student_sum, path: path })
        return;
    }
    for (let i = 0; i < tempdata.length; i++) {
        let temp = tempdata[i]
        tempData = tempdata.filter(item => item.curr2_section !== tempdata[i].curr2_section);
        findPathSectionRe(tempData, num - 1, section_sum + 1, student_sum + temp.curr2_section_student_amount, [...path, temp.curr2_section],
            student_break, student_break2)
    }
}

//Set Global variable 

var PathCurriID = [];
function findPath(data, max, min, section_break, student_break, section_break2, student_break2, last) {
    if (last) {
        findPathRe(data, data.length, 0, 0, [], section_break, student_break, section_break2, student_break2)
    }
    else {
        if (min < 1) {
            min = 1
        }
        for (let i = max; i >= min; i--) {
            findPathRe(data, i, 0, 0, [], section_break, student_break, section_break2, student_break2)
        }
    }
}

function findPathRe(tempdata, num, section_sum, student_sum, path, section_break, student_break, section_break2, student_break2) {
    if (num === 0) {
        if (section_sum >= section_break || student_sum >= student_break
            || section_sum <= section_break2 || student_sum <= student_break2) {
            return
        }
        let datatemp = PathCurriID.filter(item => item.section_sum === section_sum && item.student_sum === student_sum);
        if (datatemp.length > 0) {
            for (let k = 0; k < datatemp.length; k++) {
                if (datatemp[k].path.length === path.length) {
                    let check = 0;
                    datatemp[k].path = datatemp[k].path.sort()
                    path = path.sort()
                    for (let i = 0; i < datatemp[k].path.length; i++) {
                        for (let j = 0; j < path.length; j++) {
                            if (datatemp[k].path[i] === path[j]) {
                                check++;
                                break;
                            }
                        }
                    }
                    if (check === datatemp[k].path.length) {
                        return
                    }
                }
            }
        }
        PathCurriID.push({ section_sum: section_sum, student_sum: student_sum, path: path })
        return;
    }
    for (let i = 0; i < tempdata.length; i++) {
        let temp = tempdata[i]
        tempData = tempdata.filter(item => item.curr2_id !== tempdata[i].curr2_id);
        findPathRe(tempData, num - 1, section_sum + temp.section_sum, student_sum + temp.student_sum, [...path, temp.curr2_id],
            section_break, student_break, section_break2, student_break2)
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

function Hoursdecimal(time) {
    let hr = parseInt(time / 60)
    let mm = parseInt(time - (hr * 60))
    let str = ''
    if (hr < 10) {
        str += '0' + hr.toString() + ':'
    }
    else {
        str += hr.toString() + ':'
    }
    if (mm < 10) {
        str += '0' + mm.toString() + ':'
    }
    else {
        str += mm.toString() + ':'
    }
    str += '00'

    return str;
}

function SumOfStudent(CurriSec) {
    let sum = 0
    CurriSec.forEach(item => {
        sum += item.curr2_section_student_amount
    })
    return sum
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
        thisData.subject = SortSubject(thisData.subject)
        for (let j = 0; j < thisData.subject.length; j++) {
            let thisData2 = thisData.subject[j]
            process.stdout.write(`    Subject ${thisData2.subject_id} Section ${thisData2.subject_section} `)
            process.stdout.write(`Day ${thisData2.teach_day} Time ${thisData2.teach_time} to ${thisData2.teach_time2} L_P ${thisData2.lect_or_prac}\n`)
        }
        console.log('')
    }
    console.log("------------ END TIME TABLE ------------\n")
}

function AddDataTimeTable(time_CurriSec) {
    console.log("------------ ADD DATA TIME TABLE ------------")
    for (let i = 0; i < time_CurriSec.length; i++) {
        let thisData = time_CurriSec[i];
        for (let j = 0; j < thisData.subject.length; j++) {
            let thisData2 = thisData.subject[j]
            DataTimeTable.push({
                "subject_id": thisData2.subject_id,
                "subject_section": thisData2.subject_section,
                "curr2_section": thisData.curr2_section,
                "teach_time": thisData2.teach_time,
                "semester": semester,
                "year": year,
                "curr2_id": thisData.curr2_id,
                "teach_day": thisData2.teach_day,
                "teach_time2": thisData2.teach_time2,
                "lect_or_prac": thisData2.lect_or_prac,
                "break_time": thisData2.break_time
            })
        }

    }
    DataTimeTable = SortAllData(DataTimeTable)
    UpData(DataTimeTable)
    console.log("------------ END ADD DATA TIME TABLE ------------\n")
}

function UpData(DataTimeTable) {
    // console.log(token)
    for (let i = 0; i < DataTimeTable.length; i++) {
        let thisData2 = DataTimeTable[i]
        let res = axios.post("http://localhost:9000/API/teach_table/", {
            subject_id: thisData2.subject_id,
            subject_section: thisData2.subject_section,
            curr2_section: thisData2.curr2_section,
            teach_time: thisData2.teach_time,
            semester: thisData2.semester,
            year: thisData2.year,
            curr2_id: thisData2.curr2_id,
            teach_day: thisData2.teach_day,
            teach_time2: thisData2.teach_time2,
            lect_or_prac: thisData2.lect_or_prac,
            break_time: thisData2.break_time
        }, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
        console.log(res.data);
    }
}

function PrintDataTimeTable(uniqueSubject) {
    console.log("------------ DATA TIME TABLE ------------")
    uniqueSubject = uniqueSubject.sort(function (a, b) { return a.subject_id - b.subject_id });
    for (let j = 0; j < uniqueSubject.length; j++) {
        console.log('----------------------------------------------------------')
        console.log(' subject_id : ', uniqueSubject[j].subject_id)
        let dataTimeTable = DataTimeTable.filter(item => item.subject_id === uniqueSubject[j].subject_id && item.lect_or_prac === uniqueSubject[j].lect_or_prac)
        dataTimeTable = SortDataTimeTable(dataTimeTable)
        for (let i = 0; i < dataTimeTable.length; i++) {
            let thisData = dataTimeTable[i];
            process.stdout.write(` subject_id ${thisData.subject_id} subject_section ${thisData.subject_section} curr2_section ${thisData.curr2_section}`)
            process.stdout.write(` teach_time ${thisData.teach_time} semester ${thisData.semester} year ${thisData.year}`)
            process.stdout.write(` curr2_id ${thisData.curr2_id} teach_day ${thisData.teach_day} teach_time2 ${thisData.teach_time2}`)
            process.stdout.write(` lect_or_prac ${thisData.lect_or_prac} break_time ${thisData.break_time}`)
            console.log('')
        }
    }
    console.log("------------ END DATA TIME TABLE ------------\n")
}



function getUniqueSubject(SubSec) {
    var unique_Subject = [];
    SubSec.forEach((el) => {
        let index = unique_Subject.findIndex(item => (el.subject_id === item.subject_id && el.lect_or_prac === item.lect_or_prac));
        if (index === -1) {
            unique_Subject.push({ subject_id: el.subject_id, lect_or_prac: el.lect_or_prac, section_sum: 1, priority: 0 })
        }
        else {
            unique_Subject[index].section_sum++;
        }
    });
    return unique_Subject;
}

function SortuniqueSubject(uniqueSubject) {
    for (let i = 0; i < uniqueSubject.length; i++) {
        for (let j = i + 1; j < uniqueSubject.length; j++) {
            if (getPriority(uniqueSubject[i].subject_id) > getPriority(uniqueSubject[j].subject_id)) {
                let Temp = uniqueSubject[i]
                uniqueSubject[i] = uniqueSubject[j]
                uniqueSubject[j] = Temp
            }
        }
    }
    for (let i = 0; i < uniqueSubject.length; i++) {
        for (let j = i + 1; j < uniqueSubject.length; j++) {
            if (getPriority(uniqueSubject[i].subject_id) === getPriority(uniqueSubject[j].subject_id)) {
                if (uniqueSubject[i].section_sum > uniqueSubject[j].section_sum) {
                    let Temp = uniqueSubject[i]
                    uniqueSubject[i] = uniqueSubject[j]
                    uniqueSubject[j] = Temp
                }
            }
        }
    }
    return uniqueSubject
}

function getUniqueCurri(CurriSec) {
    var unique_Curri = [];
    CurriSec.forEach((el) => {
        let index = unique_Curri.findIndex(item => (el.curr2_id === item.curr2_id));
        if (index === -1) {
            unique_Curri.push({ curr2_id: el.curr2_id, section_sum: 1, section: [el.curr2_section], student_sum: el.curr2_section_student_amount })
        }
        else {
            unique_Curri[index].section_sum++;
            unique_Curri[index].student_sum += el.curr2_section_student_amount;
            unique_Curri[index].section.push(el.curr2_section);
        }
    });
    return unique_Curri;
}


function getTime_CurriSec(currisec) {
    var time_CurriSec = []
    currisec.forEach(item => {
        time_CurriSec.push({ ...item, subject: [] })
    })
    return time_CurriSec;
}

function getPriority(subject_id) {
    if (subject_id === '01006028') {
        return 0
    }
    if (subject_id === '01006010' || subject_id === '01006011'
        || subject_id === '01006030' || subject_id === '01006031') {
        return 1
    }
    if (subject_id === '01006015') {
        return 2
    }
    if (subject_id === '01006020' || subject_id === '01006022'
        || subject_id === '01006024') {
        return 4
    }
    if (subject_id === '01006021' || subject_id === '01006023'
        || subject_id === '01006025') {
        return 3
    }
    if (subject_id === '01006012') {
        return 5
    }
    else {
        return 6
    }
}

function DataNotimeSort(DataNotime) {
    for (let i = 0; i < DataNotime.length; i++) {
        for (let j = i + 1; j < DataNotime.length; j++) {
            if (DataNotime[i].SubjectSec.length < DataNotime[j].SubjectSec.length) {
                let Temp = DataNotime[i]
                DataNotime[i] = DataNotime[j]
                DataNotime[j] = Temp
            }
        }

    }
    for (let i = 0; i < DataNotime.length; i++) {
        for (let j = i + 1; j < DataNotime.length; j++) {
            if (DataNotime[i].SubjectSec.length === DataNotime[j].SubjectSec.length) {
                if (DataNotime[i].CurriSec.length < DataNotime[j].CurriSec.length) {
                    let Temp = DataNotime[i]
                    DataNotime[i] = DataNotime[j]
                    DataNotime[j] = Temp
                }
            }
        }

    }

    for (let i = 0; i < DataNotime.length; i++) {
        for (let j = i + 1; j < DataNotime.length; j++) {
            if (DataNotime[i].SubjectSec.length === DataNotime[j].SubjectSec.length) {
                if (DataNotime[i].CurriSec.length === DataNotime[j].CurriSec.length) {
                    if (DataNotime[i].SubjectSec[0].subject_id > DataNotime[j].SubjectSec[0].subject_id) {
                        let Temp = DataNotime[i]
                        DataNotime[i] = DataNotime[j]
                        DataNotime[j] = Temp
                    }
                }
            }
        }

    }
    return DataNotime
}

function findTimeSlot(Data) {
    let SubjectSec = Data.SubjectSec
    let CurriSec = Data.CurriSec
    let TimeSum = 0
    let break_time = 0
    for (let j = 0; j < SubjectSec.length; j++) {
        break_time = SubjectSec[j].break_time
        if (break_time === null || break_time === '') {
            break_time = 0
        }
        TimeSum += decimalHours(SubjectSec[j].teach_hr) + break_time
    }

    let TimePeriodData = TimePeriod(TimeSum)
    let TimeSlot = []
    for (let i = 0; i < TimePeriodData.length; i++) {
        let checkOverlay = false
        for (let j = 0; j < CurriSec.length; j++) {

            let time_CurriSec_index = time_CurriSec.findIndex(item => (CurriSec[j].curr2_section === item.curr2_section))
            if ((TimePeriodData[i].period === 0 || TimePeriodData[i].period === 3) && (decimalHours('03:00') <= TimeSum)) {
                checkOverlay = true
                break
            }
            time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                if (CheckTimeOverlay(item, TimePeriodData[i]) === -1) {
                    checkOverlay = true
                    return;
                }
            })
            if (checkOverlay) {
                break
            }
        }
        if (checkOverlay) {
            continue
        }
        TimeSlot.push(TimePeriodData[i])
    }
    if (TimeSlot.length > 0) {
        let DataTime = []
        DataTime[0] = TimeSlot[0]
        if (SubjectSec.length === 2) {
            let TimeSum2
            if (DataTime[0].period <= 1) {
                TimeSum2 = TimeSum / 2
                // 2 Period
                let temp = DataTime[0].teach_time2
                let time = decimalHours(DataTime[0].teach_time2)
                let time2 = decimalHours(DataTime[0].teach_time2)
                time -= TimeSum
                time = Hoursdecimal(time)
                //Middel Time Period
                time2 -= TimeSum2
                time2 = Hoursdecimal(time2)
                DataTime[0].teach_time = time
                DataTime[0].teach_time2 = time2
                DataTime.push({ period: DataTime[0].period, teach_day: DataTime[0].teach_day, teach_time: time2, teach_time2: temp })
            }
            if (DataTime[0].period >= 2) {
                TimeSum2 = TimeSum / 2
                // 2 Period
                let time = decimalHours(DataTime[0].teach_time)
                let time2 = decimalHours(DataTime[0].teach_time)
                time += TimeSum
                time = Hoursdecimal(time)
                //Middel Time Period
                time2 += TimeSum2
                time2 = Hoursdecimal(time2)

                DataTime[0].teach_time2 = time2

                DataTime.push({ period: DataTime[0].period, teach_day: DataTime[0].teach_day, teach_time: time2, teach_time2: time })


            }
        }
        else {
            if (DataTime[0].period <= 1) {
                let time = decimalHours(DataTime[0].teach_time2)
                time -= TimeSum
                time = Hoursdecimal(time)
                DataTime[0].teach_time = time
            }
            if (DataTime[0].period >= 2) {
                let time = decimalHours(DataTime[0].teach_time)
                time += TimeSum
                time = Hoursdecimal(time)
                DataTime[0].teach_time2 = time
            }

        }
        return DataTime
    }
    return TimeSlot
}

function TimePeriod(TimeSum) {

    let TimePeriod = []
    let day = ['mon', 'tue', 'thu', 'fri', 'sat', 'sun']
    if (decimalHours('01:30') >= TimeSum) {
        for (let i = 0; i < 4; i++) {
            TimePeriod.push({ period: 1, teach_day: day[i], teach_time: '10:30:00', teach_time2: '12:00:00' })
            TimePeriod.push({ period: 0, teach_day: day[i], teach_time: '08:45:00', teach_time2: '10:15:00' })
            TimePeriod.push({ period: 2, teach_day: day[i], teach_time: '13:00:00', teach_time2: '14:30:00' })
            TimePeriod.push({ period: 3, teach_day: day[i], teach_time: '14:45:00', teach_time2: '16:15:00' })
        }
        for (let i = 0; i < 4; i++) {
            TimePeriod.push({ period: 4, teach_day: day[i], teach_time: '16:30:00', teach_time2: '18:00:00' })
        }
        for (let i = 4; i < day.length; i++) {
            TimePeriod.push({ period: 1, teach_day: day[i], teach_time: '10:30:00', teach_time2: '12:00:00' })
            TimePeriod.push({ period: 0, teach_day: day[i], teach_time: '08:45:00', teach_time2: '10:15:00' })
            TimePeriod.push({ period: 2, teach_day: day[i], teach_time: '13:00:00', teach_time2: '14:30:00' })
            TimePeriod.push({ period: 3, teach_day: day[i], teach_time: '14:45:00', teach_time2: '16:15:00' })
        }
    }
    else {
        for (let i = 0; i < 4; i++) {
            TimePeriod.push({ period: 1, teach_day: day[i], teach_time: '09:30:00', teach_time2: '12:00:00' })
            //TimePeriod.push({ period: 0, teach_day: day[i], teach_time: '08:45:00', teach_time2: '10:15:00' })
            TimePeriod.push({ period: 2, teach_day: day[i], teach_time: '13:00:00', teach_time2: '15:30:00' })
            //TimePeriod.push({ period: 3, teach_day: day[i], teach_time: '14:45:00', teach_time2: '16:15:00' })
        }
        for (let i = 0; i < 4; i++) {
            TimePeriod.push({ period: 4, teach_day: day[i], teach_time: '16:30:00', teach_time2: '18:00:00' })
        }
        for (let i = 4; i < day.length; i++) {
            TimePeriod.push({ period: 1, teach_day: day[i], teach_time: '09:30:00', teach_time2: '12:00:00' })
            // TimePeriod.push({ period: 0, teach_day: day[i], teach_time: '08:45:00', teach_time2: '10:15:00' })
            TimePeriod.push({ period: 2, teach_day: day[i], teach_time: '13:00:00', teach_time2: '15:30:00' })
            // TimePeriod.push({ period: 3, teach_day: day[i], teach_time: '14:45:00', teach_time2: '16:15:00' })
        }
    }
    return TimePeriod
}

function SortSubject(subject) {
    for (let i = 0; i < subject.length; i++) {
        for (let j = i + 1; j < subject.length; j++) {
            if (subject[i].subject_section > subject[j].subject_section) {
                let Temp = subject[i]
                subject[i] = subject[j]
                subject[j] = Temp
            }
        }
    }

    for (let i = 0; i < subject.length; i++) {
        for (let j = i + 1; j < subject.length; j++) {
            if (subject[i].subject_id > subject[j].subject_id) {
                let Temp = subject[i]
                subject[i] = subject[j]
                subject[j] = Temp
            }
        }

    }

    for (let i = 0; i < subject.length; i++) {
        for (let j = i + 1; j < subject.length; j++) {
            if (decimalHours(subject[i].teach_time) > decimalHours(subject[j].teach_time)) {
                let Temp = subject[i]
                subject[i] = subject[j]
                subject[j] = Temp
            }
        }

    }
    for (let i = 0; i < subject.length; i++) {
        for (let j = i + 1; j < subject.length; j++) {
            if (DaytoInt(subject[i].teach_day) > DaytoInt(subject[j].teach_day)) {
                let Temp = subject[i]
                subject[i] = subject[j]
                subject[j] = Temp
            }
        }

    }
    return subject
}

function SortDataTimeTable(dataTimeTable) {
    for (let i = 0; i < dataTimeTable.length; i++) {
        for (let j = i + 1; j < dataTimeTable.length; j++) {
            if (dataTimeTable[i].subject_section > dataTimeTable[j].subject_section) {
                let Temp = dataTimeTable[i]
                dataTimeTable[i] = dataTimeTable[j]
                dataTimeTable[j] = Temp
            }
        }
    }

    for (let i = 0; i < dataTimeTable.length; i++) {
        for (let j = i + 1; j < dataTimeTable.length; j++) {
            if (dataTimeTable[i].subject_section === dataTimeTable[j].subject_section) {
                if (dataTimeTable[i].curr2_section > dataTimeTable[j].curr2_section) {
                    let Temp = dataTimeTable[i]
                    dataTimeTable[i] = dataTimeTable[j]
                    dataTimeTable[j] = Temp
                }
            }
        }
    }


    return dataTimeTable
}

function SortAllData(dataTimeTable) {

    for (let i = 0; i < dataTimeTable.length; i++) {
        for (let j = i + 1; j < dataTimeTable.length; j++) {
            if (dataTimeTable[i].subject_id > dataTimeTable[j].subject_id) {
                let Temp = dataTimeTable[i]
                dataTimeTable[i] = dataTimeTable[j]
                dataTimeTable[j] = Temp
            }

        }
    }
    for (let i = 0; i < dataTimeTable.length; i++) {
        for (let j = i + 1; j < dataTimeTable.length; j++) {
            if (dataTimeTable[i].subject_id === dataTimeTable[j].subject_id) {
                if (dataTimeTable[i].subject_section > dataTimeTable[j].subject_section) {
                    let Temp = dataTimeTable[i]
                    dataTimeTable[i] = dataTimeTable[j]
                    dataTimeTable[j] = Temp
                }
            }
        }
    }

    for (let i = 0; i < dataTimeTable.length; i++) {
        for (let j = i + 1; j < dataTimeTable.length; j++) {
            if (dataTimeTable[i].subject_id === dataTimeTable[j].subject_id) {
                if (dataTimeTable[i].subject_section === dataTimeTable[j].subject_section) {
                    if (dataTimeTable[i].curr2_section > dataTimeTable[j].curr2_section) {
                        let Temp = dataTimeTable[i]
                        dataTimeTable[i] = dataTimeTable[j]
                        dataTimeTable[j] = Temp
                    }
                }
            }
        }
    }

    // for (let i = 0; i < dataTimeTable.length; i++) {
    //     for (let j = i + 1; j < dataTimeTable.length; j++) {
    //         if (dataTimeTable[i].subject_id === dataTimeTable[j].subject_id) {
    //             if (dataTimeTable[i].curr2_section === dataTimeTable[j].curr2_section) {
    //                 if (dataTimeTable[i].subject_section > dataTimeTable[j].subject_section) {
    //                     let Temp = dataTimeTable[i]
    //                     dataTimeTable[i] = dataTimeTable[j]
    //                     dataTimeTable[j] = Temp
    //                 }
    //             }
    //         }
    //     }
    // }




    return dataTimeTable

}
export { timetable }
// function CallTimeTable() {
//     return timetable()
// }

