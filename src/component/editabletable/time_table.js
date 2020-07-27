const axios = require('axios');

//Set Global variable
var time_CurriSec = [];
var uniqueSubject = [];
var StringResutl = [];


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
    console.log('uniqueSubject ');
    console.log(uniqueSubject);
    //PrintTable(time_CurriSec);
    //console.log('time_CurriSec', time_CurriSec);
    console.log('');


    // Sort dy  priority
    uniqueSubject = uniqueSubject.sort(function (a, b) { return a.section_sum - b.section_sum });
    uniqueSubject = uniqueSubject.sort(function (a, b) { return getPriority(a.subject_id) - getPriority(b.subject_id) });
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

        // oder by priority number of section first
        DataCurriSec = DataCurriSec.sort(function (a, b) { return a.curr2_id - b.curr2_id });

        //console.log("DataCurriSec", DataCurriSec)
        //Print DataCurriSec
        process.stdout.write(' DataCurriSec : ')
        DataCurriSec.forEach(item => {
            process.stdout.write(item.curr2_section + ' ')
        })
        console.log("")
        console.log(" SumOfStudent : ", SumOfStudent(DataCurriSec))

        // get All Subject Section
        let DataSubjectSec = SubSec.filter(item => item.subject_id === uniqueSubject[i].subject_id && item.lect_or_prac === uniqueSubject[i].lect_or_prac)

        //Print DataSubjectSec
        process.stdout.write(' DataSubjectSec : ')
        DataSubjectSec.forEach(item => {
            process.stdout.write(item.subject_section + ' ')
        })
        console.log("")


        //Check before 
        if (DataCurriSec.length === 0) {
            console.log(`Subject_id ${uniqueSubject[i].subject_id} Do not have DataCurriSec`)
            StringResutl.push(`Subject_id ${uniqueSubject[i].subject_id} Do not have DataCurriSec`)
            continue
        }

        // Set for prioty 0 '01006028'
        if (getPriority(uniqueSubject[i].subject_id) === 0) {
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

                    StringResutl.push(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} `
                        + `don't have curr2_section ${DataSubjectSec[j].subject_section} `)
                    continue
                }

                if (DataSubjectSec[j].teach_time === null) {
                    if (DataSubjectSec[j].subject_id === '01006030') {
                        DataSubjectSec[j].teach_time = '08:45:00'
                        DataSubjectSec[j].teach_time2 = '12:00:00'
                        DataSubjectSec[j].teach_day = 'fri'
                        let time_CurriSec_index = time_CurriSec.findIndex(item => (DataSubjectSec[j].subject_section === item.curr2_section))
                        if (time_CurriSec_index > -1) {
                            time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSec[j])
                            console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                                `to curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
                        }
                        continue
                    }
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

                        StringResutl.push(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} `
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
                        time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSec[j])
                        time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSecP[j])
                        console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                            `to curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
                    }
                }
            }
            continue
        }

        // Set for prioty 3 '01006020' '01006022' '01006024'
        if (getPriority(uniqueSubject[i].subject_id) === 3) {

            let UniqueCurri = getUniqueCurri(DataCurriSec)
            let UniqueCurri2 = UniqueCurri
            //console.log('UniqueCurri', UniqueCurri)

            //Print UniqueCurri
            process.stdout.write(' UniqueCurri : ')
            UniqueCurri.forEach(item => {
                process.stdout.write(item.curr2_id + ' ')
            })
            console.log("")

            // if( uniqueSubject[i].subject_id === '01006024')
            //     continue

            let averageCurriSec = parseInt(DataCurriSec.length / (DataSubjectSec.length))
            let avergeStudent = parseInt(SumOfStudent(DataCurriSec) / (DataSubjectSec.length))
            // console.log('averageCurriSec', averageCurriSec)
            // console.log('avergeStudent', avergeStudent)
            // console.log(SumOfStudent(DataCurriSec))

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
            for (let j = 0; j < DataSubjectSec.length; j++) {
                console.log(`----DataSubjectSec ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section}----`)
                //console.log('UniqueCurri', UniqueCurri)

                // UniqueCurri = UniqueCurri.sort(function (a, b) { return parseInt(a.curr2_id) - parseInt(b.curr2_id) });
                //Print UniqueCurri
                process.stdout.write(' UniqueCurri : ')
                UniqueCurri.forEach(item => {
                    process.stdout.write(item.curr2_id + ' ')
                })
                console.log("")

                // Find path 
                let last = false
                if (j === DataSubjectSec.length - 1) {
                    last = true
                }
                PathCurriID = [];
                findPath(UniqueCurri, parseInt(averageCurriSec / min), parseInt(averageCurriSec / max),
                    averageCurriSec + max, avergeStudent + (50 * max), averageCurriSec - max, avergeStudent - (50 * max), last)
                PathCurriID = PathCurriID.sort(function (a, b) { return b.student_sum - a.student_sum });
                PathCurriID = PathCurriID.sort(function (a, b) { return b.section_sum - a.section_sum });
                //console.log('PathCurriID', PathCurriID)

                //Delete Old path like Recursive Function
                for (let k = 0; k < OldPathCurriID.length; k++) {
                    //  console.log(OldPathCurriID[k])
                    if (OldPathCurriID[k].index_j === j) {
                        let Index = []
                        PathCurriID.forEach(item => {
                            let check = 0
                            for (let l = 0; l < item.path.length; l++) {
                                if (item.path[l] === OldPathCurriID[k].path[l]) {
                                    check++
                                }
                            }
                            if (check === item.path.length && check === OldPathCurriID[k].path.length) {
                                //console.log(item,OldPathCurriID[k].path)
                                Index = item;
                            }
                        });
                        PathCurriID = PathCurriID.filter(item => item !== Index)
                    }
                }

                // if (OldPathCurriID.length > 9) {
                //     break
                // }

                //Loop for Find path is not overlay 
                while (true) {
                    // Find Min Path 
                    let AbsMinSection = averageCurriSec
                    let AbsMinStudent = avergeStudent
                    let MinSection = averageCurriSec
                    let MinStudent = avergeStudent
                    let PathTemp = []
                    PathCurriID.forEach(item => {
                        if (AbsMinSection >= Math.abs(item.section_sum - averageCurriSec)
                            && AbsMinStudent >= Math.abs(item.student_sum - avergeStudent)) {
                            AbsMinSection = Math.abs(item.section_sum - averageCurriSec)
                            AbsMinStudent = Math.abs(item.student_sum - avergeStudent)
                            MinSection = item.section_sum - averageCurriSec
                            MinStudent = item.student_sum - avergeStudent
                            PathTemp = item.path
                        }
                    })
                    console.log(AbsMinSection, AbsMinStudent, PathTemp, MinSection, MinStudent)

                    if (AbsMinSection === averageCurriSec && AbsMinStudent === avergeStudent) {
                        let lastOldPathCurriID = []
                        OldPathCurriID.forEach(item => {
                            console.log(item)
                            if (item.index_j === j - 1) {
                                //console.log(item,OldPathCurriID[k].path)
                                lastOldPathCurriID = item;
                            }
                        });
                        console.log(lastOldPathCurriID)
                        for (let k = 0; k < lastOldPathCurriID.tempUniqueCurri.length; k++) {
                            let temp = lastOldPathCurriID.tempUniqueCurri[k]
                            // Change Array To Json
                            temp = temp[0]
                            //console.log(temp)
                            UniqueCurri.push({ curr2_id: temp.curr2_id, section_sum: temp.section_sum, section: temp.section, student_sum: temp.student_sum })

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
                        console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                            `to SelectPathCurriID `)
                        //console.log(PathTemp)
                        OldPathCurriID.push({ index_j: j, path: PathTemp, tempUniqueCurri: tempUniqueCurri })
                        SelectPathCurriID[j] = PathTemp
                        break
                    }
                    let checkOverlay = false
                    for (let k = 0; k < PathTemp.length; k++) {
                        console.log(` => Check ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                            `to curr2_id ${PathTemp[k]}`)
                        let UniqueCurri_index = UniqueCurri.findIndex(item => (PathTemp[k] === item.curr2_id))
                        for (let l = 0; l < UniqueCurri[UniqueCurri_index].section.length; l++) {

                            console.log(UniqueCurri[UniqueCurri_index].section[l])
                            let time_CurriSec_index = time_CurriSec.findIndex(item =>
                                (UniqueCurri[UniqueCurri_index].section[l] === item.curr2_section))

                            //Check Overlay time Subject Section
                            time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                                if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {
                                    console.log(item, DataSubjectSec[j], 'in', time_CurriSec[time_CurriSec_index].section)
                                    checkOverlay = true
                                    return;
                                }
                            })
                            if (checkOverlay) {
                                console.log(` => Overlay ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                                    `in curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
                                break
                            }
                        }
                        if (checkOverlay) {
                            break
                        }

                    }

                    let tempUniqueCurri = []
                    for (let k = 0; k < PathTemp.length; k++) {
                        tempUniqueCurri.push(UniqueCurri.filter(item => item.curr2_id === PathTemp[k]))
                        UniqueCurri = UniqueCurri.filter(item => item.curr2_id !== PathTemp[k])
                    }
                    OldPathCurriID.push({ index_j: j, path: PathTemp, tempUniqueCurri: tempUniqueCurri })

                    if (!checkOverlay) {
                        console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                            `to SelectPathCurriID `)
                        //console.log(PathTemp)
                        SelectPathCurriID[j] = PathTemp
                        break
                    }
                }

            }
            // console.log('OldPathCurriID')
            // for (let j = 0; j < OldPathCurriID.length; j++) {
            //     console.log(OldPathCurriID[j])
            // }
            console.log('SelectPathCurriID')
            for (let j = 0; j < DataSubjectSec.length; j++) {
                let PathTemp = SelectPathCurriID[j]
                let tempCurri = []
                let tempSubject = []
                tempSubject[0] = DataSubjectSec[j]
                for (let k = 0; k < PathTemp.length; k++) {
                    let UniqueCurri_index = UniqueCurri2.findIndex(item => (PathTemp[k] === item.curr2_id))
                    for (let l = 0; l < UniqueCurri2[UniqueCurri_index].section.length; l++) {
                        //console.log(UniqueCurri2[UniqueCurri_index].section[l])
                        let temp = DataCurriSec.find(item => (UniqueCurri2[UniqueCurri_index].section[l] === item.curr2_section))
                        tempCurri.push(temp)
                    }
                }
                console.log(`----DataSubjectSec ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section}----`)
                //Print DataCurriSec
                process.stdout.write(' tempCurri : ')
                tempCurri.forEach(item => {
                    process.stdout.write(item.curr2_section + ' ')
                })
                console.log("")

                if (DataSubjectSec[j].teach_time === null) {
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
                        console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                            `to curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
                    }
                }
            }
            continue
        }

        // Set for prioty 4 '01006021' '01006023' '01006025'
        if (getPriority(uniqueSubject[i].subject_id) === 4) {
            //DataCurriSec = DataCurriSec.sort(function (a, b) { return a.curr2_section - b.curr2_section });
            let DataCurriSecTemp = DataCurriSec.sort(function (a, b) { return a.curr2_section - b.curr2_section });
            DataCurriSecTemp = DataCurriSecTemp.sort(function (a, b) { return a.curr2_section_student_amount - b.curr2_section_student_amount });
            //DataCurriSecTemp = DataCurriSec.sort(function (a, b) { return a.curr2_id - b.curr2_id });
            let dataLeft = { CurriSec: DataCurriSecTemp[0], amount: DataCurriSecTemp[0].curr2_section_student_amount }
            DataCurriSecTemp = DataCurriSecTemp.filter(item => item.curr2_section !== DataCurriSecTemp[0].curr2_section)

            let MaxAmount = 140
            if (uniqueSubject[i].subject_id === '01006025') {
                MaxAmount = 110
            }
            let SelectPathCurriSec = [];
            for (let j = 0; j < DataSubjectSec.length; j++) {
                console.log(`----DataSubjectSec ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section}----`)
                let SumAmount = dataLeft.amount
                let Section = []
                if (dataLeft.CurriSec !== '') {
                    Section.push(dataLeft.CurriSec)
                }

                // Print 
                process.stdout.write(' DataCurriSecTemp : ')
                DataCurriSecTemp.forEach(item => {
                    process.stdout.write(item.curr2_section + ' ')
                })
                console.log("")

                //Print Section
                process.stdout.write(' Section : ')
                Section.forEach(item => {
                    process.stdout.write(item.curr2_section + ' ')
                })
                console.log("")
                console.log(' SumAmount ', SumAmount)

                //Check before 
                if (DataCurriSecTemp.length === 0) {
                    console.log(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} Do not have DataCurriSec`)
                    StringResutl.push(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} Do not have DataCurriSec`)
                    continue
                }

                let k = 0
                while (true) {
                    // console.log('Amount ', DataCurriSecTemp[k].curr2_section_student_amount)
                    // console.log('Section ', DataCurriSecTemp[k].curr2_section)
                    if (MaxAmount >= SumAmount + DataCurriSecTemp[k].curr2_section_student_amount) {
                        Section.push(DataCurriSecTemp[k])
                        SumAmount += DataCurriSecTemp[k].curr2_section_student_amount
                    }

                    k++
                    if (k >= DataCurriSecTemp.length) {
                        break
                    }
                }

                //Clear Data
                for (let k = 0; k < Section.length; k++) {
                    //console.log(Section[k].curr2_section)
                    DataCurriSecTemp = DataCurriSecTemp.filter(item => item.curr2_section !== Section[k].curr2_section)
                }
                dataLeft = { CurriSec: '', amount: 0 }

                if (SumAmount < MaxAmount && DataCurriSecTemp.length > 0) {
                    console.log("min-----")
                    let temp = DataCurriSecTemp[0]
                    let minAmount = temp.curr2_section_student_amount
                    DataCurriSecTemp.forEach(item => {
                        if (minAmount > item.curr2_section_student_amount) {
                            temp = item
                            minAmount = temp.curr2_section_student_amount
                        }
                    })

                    console.log('minAmount ', minAmount)
                    console.log('curr2_section ', temp.curr2_section)

                    let amountLeft = MaxAmount - SumAmount
                    dataLeft = { CurriSec: temp, amount: temp.curr2_section_student_amount - amountLeft }
                    Section.push(temp)
                    SumAmount += amountLeft
                    DataCurriSecTemp = DataCurriSecTemp.filter(item => item.curr2_section !== temp.curr2_section)
                }

                //console.log('Section ', Section)
                //Print Section
                process.stdout.write(' Section : ')
                Section.forEach(item => {
                    process.stdout.write(item.curr2_section + ' ')
                })
                console.log("")
                console.log(' SumAmount ', SumAmount)

                if (DataSubjectSec[j].teach_time === null) {

                    console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                        `to SelectPathCurriSec `)
                    //console.log(PathTemp)
                    Section.forEach(item => {

                    })
                    SelectPathCurriSec[j] = Section
                    continue
                }

                // let checkOverlay = false
                // for (let k = 0; k < PathTemp.length; k++) {
                //     console.log(` => Check ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                //         `to curr2_id ${PathTemp[k]}`)
                //     let UniqueCurri_index = UniqueCurri.findIndex(item => (PathTemp[k] === item.curr2_id))
                //     for (let l = 0; l < UniqueCurri[UniqueCurri_index].section.length; l++) {

                //         console.log(UniqueCurri[UniqueCurri_index].section[l])
                //         let time_CurriSec_index = time_CurriSec.findIndex(item =>
                //             (UniqueCurri[UniqueCurri_index].section[l] === item.curr2_section))

                //         //Check Overlay time Subject Section
                //         time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                //             if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {
                //                 console.log(item, DataSubjectSec[j], 'in', time_CurriSec[time_CurriSec_index].section)
                //                 checkOverlay = true
                //                 return;
                //             }
                //         })
                //         if (checkOverlay) {
                //             console.log(` => Overlay ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                //                 `in curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
                //             break
                //         }
                //     }
                //     if (checkOverlay) {
                //         break
                //     }

                // }

                //break
            }
            if (DataCurriSecTemp.length > 0) {
                console.log(`Subject_id ${uniqueSubject[i].subject_id} have DataCurriSec is not in SubjectSection`)
                StringResutl.push(`Subject_id ${uniqueSubject[i].subject_id} have DataCurriSec is not in SubjectSection`)
            }

            for (let j = 0; j < SelectPathCurriSec.length; j++) {
                console.log(`----DataSubjectSec ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section}----`)
                let tempSubject = []
                tempSubject[0] = DataSubjectSec[j]
                let tempCurri = SelectPathCurriSec[j]
                if (DataSubjectSec[j].teach_time === null) {
                    tempSubject
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
                        console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                            `to curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
                    }
                }
            }
            continue
        }

        // Set for prioty 5 '01006012'
        if (getPriority(uniqueSubject[i].subject_id) === 5) {
            if (uniqueSubject[i].lect_or_prac === 'l') {
                let DataSubjectSecP = SubSec.filter(item => item.subject_id === uniqueSubject[i].subject_id && item.lect_or_prac === "p");
                DataSubjectSec = DataSubjectSec.sort(function (a, b) { return a.subject_section - b.subject_section });
                DataSubjectSecP = DataSubjectSecP.sort(function (a, b) { return a.subject_section - b.subject_section });

                let MaxAmount = 40
                let DataCurriSecTemp = DataCurriSec.sort(function (a, b) { return a.curr2_section - b.curr2_section });
                DataCurriSecTemp = DataCurriSec.sort(function (a, b) { return Math.abs(MaxAmount - a.curr2_section_student_amount) - Math.abs(MaxAmount - b.curr2_section_student_amount) });

                // Print 
                process.stdout.write(' DataCurriSecTemp : ')
                DataCurriSecTemp.forEach(item => {
                    process.stdout.write(item.curr2_section + ' ')
                })
                console.log("")

                let dataLeft = { CurriSec: DataCurriSecTemp[0], amount: DataCurriSecTemp[0].curr2_section_student_amount }
                DataCurriSecTemp = DataCurriSecTemp.filter(item => item.curr2_section !== DataCurriSecTemp[0].curr2_section)


                let SelectPathCurriSec = [];
                for (let j = 0; j < DataSubjectSec.length; j++) {
                    console.log(`----DataSubjectSec ${DataSubjectSec[j].subject_id} Section L ${DataSubjectSec[j].subject_section}----`)
                    console.log(`----DataSubjectSec ${DataSubjectSecP[j].subject_id} Section P ${DataSubjectSecP[j].subject_section}----`)
                    let SumAmount = dataLeft.amount
                    let Section = []
                    if (dataLeft.CurriSec !== '') {
                        Section.push(dataLeft.CurriSec)
                    }
                    // Print 
                    process.stdout.write(' DataCurriSecTemp : ')
                    DataCurriSecTemp.forEach(item => {
                        process.stdout.write(item.curr2_section + ' ')
                    })
                    console.log("")

                    //Print Section
                    console.log('Before In Loop')
                    process.stdout.write(' Section : ')
                    Section.forEach(item => {
                        process.stdout.write(item.curr2_section + ' ')
                    })
                    console.log("")
                    console.log(' SumAmount ', SumAmount)

                    //Check before 
                    if (DataCurriSecTemp.length === 0 && Section.length === 0) {
                        console.log(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} Do not have DataCurriSec`)
                        StringResutl.push(`Subject_id ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} Do not have DataCurriSec`)
                        continue
                    }

                    let k = 0
                    while (true) {
                        // console.log('Amount ', DataCurriSecTemp[k].curr2_section_student_amount)
                        // console.log('Section ', DataCurriSecTemp[k].curr2_section)
                        if (k >= DataCurriSecTemp.length) {
                            break
                        }
                        if (MaxAmount >= SumAmount + DataCurriSecTemp[k].curr2_section_student_amount) {
                            Section.push(DataCurriSecTemp[k])
                            SumAmount += DataCurriSecTemp[k].curr2_section_student_amount
                        }
                        k++

                    }

                    //Clear Data
                    for (let k = 0; k < Section.length; k++) {
                        //console.log(Section[k].curr2_section)
                        DataCurriSecTemp = DataCurriSecTemp.filter(item => item.curr2_section !== Section[k].curr2_section)
                    }

                    dataLeft = { CurriSec: '', amount: 0 }
                    if (SumAmount < MaxAmount && DataCurriSecTemp.length > 0) {
                        console.log("min-----")
                        let temp = DataCurriSecTemp[0]
                        let minAmount = temp.curr2_section_student_amount
                        DataCurriSecTemp.forEach(item => {
                            if (minAmount > item.curr2_section_student_amount) {
                                temp = item
                                minAmount = temp.curr2_section_student_amount
                            }
                        })


                        console.log('minAmount ', minAmount)
                        console.log('curr2_section ', temp.curr2_section)

                        let amountLeft = MaxAmount - SumAmount
                        dataLeft = { CurriSec: temp, amount: temp.curr2_section_student_amount - amountLeft }
                        Section.push(temp)
                        SumAmount += amountLeft
                        DataCurriSecTemp = DataCurriSecTemp.filter(item => item.curr2_section !== temp.curr2_section)
                    }

                    if (SumAmount > MaxAmount && Section.length === 1) {
                        console.log("SumAmount > MaxAmount")
                        let temp = Section[0]
                        let minAmount = SumAmount

                        console.log('SumAmount ', minAmount)
                        console.log('curr2_section ', temp.curr2_section)
                        dataLeft = { CurriSec: temp, amount: SumAmount - MaxAmount }

                    }


                    //console.log('Section ', Section)
                    //Print Section
                    console.log('After Loop')
                    process.stdout.write(' Section : ')
                    Section.forEach(item => {
                        process.stdout.write(item.curr2_section + ' ')
                    })
                    console.log("")
                    console.log(' SumAmount ', SumAmount)

                    if (DataSubjectSec[j].teach_time === null) {

                        console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                            `to SelectPathCurriSec `)

                        SelectPathCurriSec[j] = Section
                        continue
                    }

                    // let checkOverlay = false
                    // for (let k = 0; k < PathTemp.length; k++) {
                    //     console.log(` => Check ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                    //         `to curr2_id ${PathTemp[k]}`)
                    //     let UniqueCurri_index = UniqueCurri.findIndex(item => (PathTemp[k] === item.curr2_id))
                    //     for (let l = 0; l < UniqueCurri[UniqueCurri_index].section.length; l++) {

                    //         console.log(UniqueCurri[UniqueCurri_index].section[l])
                    //         let time_CurriSec_index = time_CurriSec.findIndex(item =>
                    //             (UniqueCurri[UniqueCurri_index].section[l] === item.curr2_section))

                    //         //Check Overlay time Subject Section
                    //         time_CurriSec[time_CurriSec_index].subject.forEach(item => {
                    //             if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {
                    //                 console.log(item, DataSubjectSec[j], 'in', time_CurriSec[time_CurriSec_index].section)
                    //                 checkOverlay = true
                    //                 return;
                    //             }
                    //         })
                    //         if (checkOverlay) {
                    //             console.log(` => Overlay ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                    //                 `in curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
                    //             break
                    //         }
                    //     }
                    //     if (checkOverlay) {
                    //         break
                    //     }

                    // }

                    //break


                }
                for (let j = 0; j < SelectPathCurriSec.length; j++) {
                    console.log(`----DataSubjectSec ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section}----`)
                    let tempCurri = SelectPathCurriSec[j]
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
                            console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
                                `to curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
                        }
                    }
                }
            }
            continue
        }


        // let checkRe = 0;
        // let OldPath = [];
        // for (let j = 0; j < DataSubjectSec.length; j++) {
        //     console.log(`----DataSubjectSec ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section}----`)

        //     if (DataCurriSec.length === 0) {
        //         console.log('Do not have any CurriSec')
        //         continue
        //     }

        //     if (checkRe === 1) {

        //     }
        //     //Find Curri Section is not overlay for this Subject Section
        //     let CheckedDataSubjectSec = [];
        //     for (let k = 0; k < DataCurriSec.length; k++) {
        //         let time_CurriSec_index = time_CurriSec.findIndex(item => (DataCurriSec[k].curr2_section === item.curr2_section))
        //         let check = 1
        //         time_CurriSec[time_CurriSec_index].subject.forEach(item => {
        //             if (CheckTimeOverlay(item, DataSubjectSec[j]) === -1) {
        //                 check = -1
        //             return;
        //         }
        //     })
        //     if (check === 1) {
        //         CheckedDataSubjectSec.push(DataCurriSec[k])
        //     }

        // }

        // //Print 
        // PrintCheckedDataSubjectSec(CheckedDataSubjectSec)

        // //don't have any curri to add in this subject section
        // if (CheckedDataSubjectSec.length === 0) {
        //     console.log("No Curri_Sec can push in this Sub_Sec")
        //     //j--
        //     continue
        // }



        // // 1 by 1
        // if (DataSubjectSec[j].subject_section_student_amount === null) {
        //     let time_CurriSec_index = time_CurriSec.findIndex(item => (CheckedDataSubjectSec[0].curr2_section === item.curr2_section))
        //     time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSec[j])
        //     DataCurriSec = DataCurriSec.filter(item => item.curr2_section !== CheckedDataSubjectSec[0].curr2_section)
        //     console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
        //         `to curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)
        //     continue
        // }

        // Find path for min Num
        // allpath = [];
        //SumOfNum(CheckedDataSubjectSec, CheckedDataSubjectSec.length)
        //console.log('allpath', allpath)


        // let Max = DataSubjectSec[j].subject_section_student_amount;
        // let dataPath = [];
        // for (let k = 0; k < allpath.length; k++) {
        //     if (Max >= allpath[k].sum) {
        //         dataPath.push(allpath[k])
        //     }
        // }

        // let min = DataSubjectSec[j].subject_section_student_amount;
        // let dataPath = [];
        // for (let k = 0; k < allpath.length; k++) {
        //     let NumOfStuMin = DataSubjectSec[j].subject_section_student_amount - allpath[k].sum
        //     if (NumOfStuMin >= 0 && min > NumOfStuMin) {
        //         console.log('NumOfStuMin', NumOfStuMin)
        //         min = NumOfStuMin
        //         dataPath = allpath[k]
        //     }
        // }
        // console.log(dataPath)
        // if (dataPath.length === 0)
        //     continue
        // for (let k = 0; k < dataPath[0].path.length; k++) {
        //     console.log(dataPath[0].path[k])
        //     let time_CurriSec_index = time_CurriSec.findIndex(item => (dataPath[0].path[k] === item.curr2_section))
        //     time_CurriSec[time_CurriSec_index].subject.push(DataSubjectSec[j])
        //     DataCurriSec = DataCurriSec.filter(item => item.curr2_section !== dataPath[0].path[k])
        //     console.log(` => Add ${DataSubjectSec[j].subject_id} Section ${DataSubjectSec[j].subject_section} ` +
        //         `to curr2_section ${time_CurriSec[time_CurriSec_index].curr2_section}`)

        // }


    }
    //     console.log('')
    //     if (DataCurriSec.length > 0) {
    //         console.log("Have DataCurriSec is not in DataSubSec")
    //     }    

    // }

    DataNotime = DataNotime.sort(function (a, b) { return b.SubjectSec[0].subject_id - a.SubjectSec[0].subject_id });
    //DataNotime = DataNotime.sort(function (a, b) { return b.CurriSec.length - a.CurriSec.length });
    //DataNotime = DataNotime.sort(function (a, b) { return b.SubjectSec.length - a.SubjectSec.length });


    DataNotime = DataNotimeSort(DataNotime)
    console.log('----DataNotime -----')
    for (let i = 0; i < DataNotime.length; i++) {
        let SubjectSec = DataNotime[i].SubjectSec
        let CurriSec = DataNotime[i].CurriSec
        //console.log(DataNotime[i].SubjectSec)
        //console.log('SubjectSec ', SubjectSec)
        for (let j = 0; j < SubjectSec.length; j++) {
            console.log(`subject_id ${SubjectSec[j].subject_id} Section ${SubjectSec[j].subject_section} `)
        }
        process.stdout.write(`to curr2_section : `)
        //console.log('CurriSec', CurriSec)
        for (let j = 0; j < CurriSec.length; j++) {
            process.stdout.write(` ${CurriSec[j].curr2_section}`)
        }
        console.log('')

        let TimeSlot = findTimeSlot(DataNotime[i])
        console.log(TimeSlot)
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
    console.log('---------------StringResutl---------------')
    for (let i = 0; i < StringResutl.length; i++) {
        console.log(StringResutl[i])
    }
    console.log('')


    PrintTable(time_CurriSec)
}




//Set Global variable 
var tempData = [];
var allpath = [];

function SumOfNum(data, num) {
    // if (num >= 4)
    //     num = 4
    for (let i = num; i > 0; i--) {
        tempData = data
        SumOfNumRe(tempData, i, 0, [])
    }
    //Clear Duplicates Data Path

}

function SumOfNumRe(tempdata, num, sum, path) {
    if (num === 0) {
        let datatemp = allpath.filter(item => item.sum === sum);
        //let index = allpath.findIndex(item => item.sum === sum);
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
        allpath.push({ sum: sum, path: path })
        return;
    }
    for (let i = 0; i < tempdata.length; i++) {
        let temp = tempdata[i]
        tempData = tempdata.filter(item => item.curr2_section !== tempdata[i].curr2_section);
        SumOfNumRe(tempData, num - 1, sum + temp.curr2_section_student_amount, [...path, temp.curr2_section])
    }
}

//Set Global variable 

var PathCurriID = [];
function findPath(data, max, min, section_break, student_break, section_break2, student_break2, last) {
    if (last) {
        findPathRe(data, data.length, 0, 0, [], section_break, student_break, section_break2, student_break2)
    }
    else {
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
    // console.log('hr ', hr)
    // console.log('mm ', mm)
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
    //console.log(str)
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
        thisData.subject = thisData.subject.sort(function (a, b) { return a.subject_id - b.subject_id });
        //thisData.subject = thisData.subject.sort(function (a, b) { return decimalHours(a.teach_time) - decimalHours(b.teach_time) });
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

function PrintCheckedDataSubjectSec(CheckedDataSubjectSec) {
    //Print DataCurriSec
    process.stdout.write('CheckedDataSubjectSec ')
    CheckedDataSubjectSec.forEach(item => {
        process.stdout.write(item.curr2_section + ' ')
    })
    console.log("")
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
        return 0;
    }
    if (subject_id === '01006010' || subject_id === '01006011'
        || subject_id === '01006030' || subject_id === '01006031') {
        return 1;
    }
    if (subject_id === '01006015') {
        return 2;
    }
    if (subject_id === '01006020' || subject_id === '01006022'
        || subject_id === '01006024') {
        return 3;
    }
    if (subject_id === '01006021' || subject_id === '01006023'
        || subject_id === '01006025') {
        return 4;
    }
    if (subject_id === '01006012') {
        return 5;
    }
    else {
        return 6;
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
    return DataNotime
}

function findTimeSlot(Data) {
    let SubjectSec = Data.SubjectSec
    let CurriSec = Data.CurriSec
    let TimeSum = 0
    let break_time = 0
    //let TimeSlot = TimePeriod()
    //console.log(DataNotime[i].SubjectSec)
    //console.log('SubjectSec ', SubjectSec)
    for (let j = 0; j < SubjectSec.length; j++) {
        console.log(`subject_id ${SubjectSec[j].subject_id} Section ${SubjectSec[j].subject_section} `)
        break_time = SubjectSec[j].break_time
        if (break_time === null || break_time === '') {
            break_time = 0
        }
        TimeSum += decimalHours(SubjectSec[j].teach_hr) + break_time
    }
    console.log('TimeSum ', TimeSum)
    console.log(`to curr2_section : `)

    let TimePeriodData = TimePeriod()
    let TimeSlot = []
    for (let i = 0; i < TimePeriodData.length; i++) {
        let checkOverlay = false
        for (let j = 0; j < CurriSec.length; j++) {
            //console.log(` ${CurriSec[j].curr2_section}`)
            let time_CurriSec_index = time_CurriSec.findIndex(item => (CurriSec[j].curr2_section === item.curr2_section))

            //Check Overlay time Subject Section
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
            //DataTime[1] = TimeSlot[0]
            if (DataTime[0].period === 1) {
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
                // console.log('time ', time)
                // console.log('time2 ', time2)
                DataTime[0].teach_time = time
                DataTime[0].teach_time2 = time2

                DataTime.push({ period: DataTime[0].period, teach_day: DataTime[0].teach_day, teach_time: time2, teach_time2: temp })

                // DataTime[1].teach_time = time2
                // DataTime[1].teach_time = temp

            }
            if (DataTime[0].period === 2) {
                TimeSum2 = TimeSum / 2
                // 2 Period
                let time = decimalHours(DataTime[0].teach_time)
                let time2 = decimalHours(DataTime[0].teach_time)
                time += TimeSum
                time = Hoursdecimal(time)
                //Middel Time Period
                time2 += TimeSum2
                time2 = Hoursdecimal(time2)
                //console.log(time)
                //DataTime[0].teach_time = time
                DataTime[0].teach_time2 = time2

                DataTime.push({ period: DataTime[0].period, teach_day: DataTime[0].teach_day, teach_time: time2, teach_time2: time })

                // DataTime[1].teach_time = time2
                // DataTime[1].teach_time2 = time
            }
            if (DataTime[0].period === 3) {

                TimeSum2 = TimeSum / 2
                // 2 Period
                let time = decimalHours(DataTime[0].teach_time)
                let time2 = decimalHours(DataTime[0].teach_time)
                time += TimeSum
                time = Hoursdecimal(time)
                //Middel Time Period
                time2 += TimeSum2
                time2 = Hoursdecimal(time2)
                //console.log(time)
                //DataTime[0].teach_time = time
                DataTime[0].teach_time2 = time2

                DataTime.push({ period: DataTime[0].period, teach_day: DataTime[0].teach_day, teach_time: time2, teach_time2: time })

                // DataTime[1].teach_time = time2
                // DataTime[1].teach_time2 = time
            }
        }
        else {
            if (DataTime[0].period === 1) {
                let time = decimalHours(DataTime[0].teach_time2)
                time -= TimeSum
                time = Hoursdecimal(time)
                //console.log(time)
                DataTime[0].teach_time = time
            }
            if (DataTime[0].period === 2) {
                let time = decimalHours(DataTime[0].teach_time)
                time += TimeSum
                time = Hoursdecimal(time)
                //console.log(time)
                DataTime[0].teach_time2 = time
            }
            if (DataTime[0].period === 3) {
                let time = decimalHours(DataTime[0].teach_time)
                time += TimeSum
                time = Hoursdecimal(time)
                //console.log(time)
                DataTime[0].teach_time2 = time
            }
        }
        // console.log('time ', DataTime[0].teach_time)
        // console.log('time2 ', DataTime[0].teach_time2)
        // console.log('time ', DataTime[1].teach_time)
        // console.log('time2 ', DataTime[1].teach_time2)
        return DataTime
    }
    //console.log('TimeSlot ',TimeSlot)
    return TimeSlot
}

function TimePeriod() {
    // let TimePeriod = [
    //     { preiod: 1,teach_day:'mon' },
    // ]
    let TimePeriod = []
    let day = ['mon', 'tue', 'thu', 'fri', 'sat', 'sun']
    //let day = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    for (let i = 0; i < 4; i++) {
        TimePeriod.push({ period: 1, teach_day: day[i], teach_time: '10:00:00', teach_time2: '12:00:00' })
        TimePeriod.push({ period: 2, teach_day: day[i], teach_time: '12:00:00', teach_time2: '14:00:00' })
    }
    for (let i = 0; i < 4; i++) {
        TimePeriod.push({ period: 3, teach_day: day[i], teach_time: '16:30:00', teach_time2: '18:00:00' })
    }
    for (let i = 4; i < day.length; i++) {
        TimePeriod.push({ period: 1, teach_day: day[i], teach_time: '10:00:00', teach_time2: '12:00:00' })
        TimePeriod.push({ period: 2, teach_day: day[i], teach_time: '12:00:00', teach_time2: '14:00:00' })
    }
    
    
    //console.log(TimePeriod)
    return TimePeriod
}

timetable()

