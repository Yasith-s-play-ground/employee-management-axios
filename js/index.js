/* Enable Tooltip Texts */

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

const API_URL = 'http://localhost:3001/employees';

loadAllEmployees();

let isUpdating = false;

let rowClickedEvent = undefined;

async function loadAllEmployees() {
    const employeeList = await $.ajax(API_URL);
    console.log(employeeList);
    if (employeeList.length) {
        $('#tbl-employee>tfoot').hide();
        employeeList.forEach(employee => {
            addEmployeeRow(employee);
        });
    } else {
        $('#tbl-employee>tfoot').show();
    }
}


$('#btn-new-employee').on('click', e => {
    $('form').trigger('reset');
    $('#txt-id').val(generateNewId());
    $('#txt-name').trigger('focus');
    $('#btn-save').prop('disabled', false);
    isUpdating = false;
});

function generateNewId() {

    console.log('last empid is ', $('#tbl-employee>tbody>tr:last-child>td:first-child').text());

    /* Strings have pad start and pad end in EcmaScript */
    return 'E-' + (((+$('#tbl-employee>tbody>tr:last-child>td:first-child').text()
        .replace('E-', '')) + 1) + '').padStart(3, '0');
}

$('form').on('submit', (event) => {
    event.preventDefault();
    if (!validateData()) return;
    if (!isUpdating) saveEmployee();
    else updateEmployee();
});

// function saveEmployee() {
//     console.log($('select').selectedIndex);
//     try {
//         const newEmployee = {
//             id: $('#txt-id').val().trim(),
//             name: $('#txt-name').val().trim(),
//             address: $('#txt-address').val().trim(),
//             gender: `${$('#rb-gender-female').selected ? 'female' : 'male'}`,
//             department:$('#combo-box').selected.value
//         }
//         $.ajax(API_URL, {
//             method: 'POST',
//             data: JSON.stringify(newEmployee),
//             headers: {
//                 'content-type': 'application/json'
//             }
//         });
//
// //         let genderImageHTML = `<i class="bi bi-person-standing-dress"></i>`;
// //         if (newEmployee.gender === 'male') {
// //             genderImageHTML = `<i class="bi bi-person-standing"></i>`;
// //         }
// //
// //         const rowHTML = `
// // <tr>
// //             <td>${genderImageHTML}</i></td>
// //             <td>${newEmployee.id}</td>
// //             <td>${newEmployee.name}</td>
// //             <td>${newEmployee.department}</td>
// //             <td><i class="bi bi-trash"></i></td>
// //         </tr>
// // `;
// //         $('#tbl-student>tbody').append(rowHTML);
// //         $('#tbl-student>tfoot').hide();/* hide footer if a record is added */
// //         $('#btn-new-student').trigger('click');
//
//     } catch (e) {
//         alert('Failed to create the employee!, try again');
//         console.error(e);
//     }
// }

async function saveEmployee() {
    const newEmployee = {
        id: $('#txt-id').val().trim(),
        name: $('#txt-name').val().trim(),
        address: $('#txt-address').val().trim(),
        gender: $('input[type="radio"][name="gender"]:checked').val(),
        department: $('#cb-department').val()
    }

    try {
        $('#btn-new-employee, form :is(input, button, textarea, select)').prop('disabled', true);
        const response = await axios(API_URL, {
            method: 'POST',
            data: newEmployee,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status !== 201) {
            throw new Error(response.status + " " + response.data);
        }
        alert('saved');
        addEmployeeRow(newEmployee);
    } catch (e) {
        alert('Failed to save employee');
        console.error(e);
    } finally {
        $('#btn-new-employee, form :is(input, button, textarea, select)').prop('disabled', false);
    }
}

async function updateEmployee() {
    const updatedEmployee = {
        id: $('#txt-id').val().trim(),
        name: $('#txt-name').val().trim(),
        address: $('#txt-address').val().trim(),
        gender: $('input[type="radio"][name="gender"]:checked').val(),
        department: $('#cb-department').val()
    }

    try {
        $('#btn-new-employee, form :is(input, button, textarea, select)').prop('disabled', true);
        const response = await axios(`${API_URL}/${updatedEmployee.id}`, {
            method: 'PATCH',
            data: updatedEmployee,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status !== 200 && response.status !== 204) {
            throw new Error(response.status + " " + response.data);
        }
        alert('updated');
        updateEmployeeRow(updatedEmployee);
    } catch (e) {
        alert('Failed to update employee');
        console.error(e);
    } finally {
        $('#btn-new-employee, form :is(input, button, textarea, select)').prop('disabled', false);
    }
}

function updateEmployeeRow({id, name, gender, department}) {
    const updatingRow = $(rowClickedEvent.target).parents('tr');
    updatingRow.children().first().next().html(`<i class="bi bi-gender-${gender} pt-0 pb-0"></i>
        ${name}`);
    updatingRow.children().first().next().next().text(department);
    $('form').trigger('reset');
}


function addEmployeeRow({id, name, gender, department}) {
    const rowHTML = `
                     <tr tabindex="0">
                        <td>${id}</td>
                        <td>
                            <i class="bi bi-gender-${gender} pt-0 pb-0"></i>
                            ${name}
                        </td>
                        <td>${department}</td>
                        <td><i data-bs-toggle="tooltip" data-bs-title="Delete" class="bi bi-trash3-fill pb-0 pt-0"></i></td>
                    </tr>   
    `;

    $('#tbl-employee>tbody').append(rowHTML);
    $('#tbl-employee>tfoot').hide();
    $('form').trigger('reset');

}

/* form reset event */
$('form').on('reset', (event) => {
    $('#btn-save').prop('disabled', true);
    $('.is-invalid').removeClass('is-invalid');
});

function validateData() {
    let valid = true;
    if ($('#cb-department').val() === 'no-department') {
        $('#cb-department').addClass('is-invalid')
            .trigger('focus');
        valid = false;
    }

    if (!$('input[name="gender"]:checked').length) {
        $('input[name="gender"]').addClass('is-invalid')
            .first().trigger('focus');
        valid = false;
    }

    if ($('#txt-address').val().trim().length < 3) {
        $('#txt-address').addClass('is-invalid')
            .trigger('focus').trigger('select');
        valid = false;
    }

    /* if pattern doesn't match entered name */
    if (!/^[A-Za-z ]+$/.test($('#txt-name').val().trim())) {
        $('#txt-name').addClass('is-invalid').trigger('focus').trigger('select').next().text(!($('#txt-name').val().trim().length)
            ? 'Name cannot be empty'
            : 'Invalid Name');
        valid = false;
    }
    return valid;
}

$('#cb-department, input[name="gender"], #txt-address, #txt-name').on('input', (event) => {
    $(event.target.name === 'gender' ? 'input[name="gender"]' : event.target).removeClass('is-invalid');
});

/* creating interceptor */
axios.interceptors.request.use(config => {
    $('#progress-bar').css('width', '10%'); /* showing initial progress */
    config.onUploadProgress = (e) => {
        $('#progress-bar').css('width', `${e.loaded / e.total * 100}%`);
        console.log(e);

        if (e.loaded === e.total) {
            setTimeout(() => {
                $('#progress-bar')
                    .hide()
                    .css('width', '0');
            }, 500);

        }
    };
    console.log(config);
    return config;
});

/* to delete */

async function deleteEmployee(e) {
    let empId = ($(e.target).parents('tr').children().first().text());

    if (e.type === 'keydown') empId = $(e.target).children().first().text();

    console.log(empId);

    /* sending request to delete the selected employee */
    try {

        const response = await axios.delete(`${API_URL}/${empId}`);
        if (response.status !== 200 && response.status !== 204) {
            throw new Error(response.status + " " + response.data);
        }
        alert('deleted');
        $(e.target).parents('tr').fadeOut(300, () => {
            $(e.target).parents('tr').remove();

            if (!$('#tbl-employee>tbody>tr').length) $('#tbl-employee>tfoot').show();

        }); /* delete the row from table with an animation */

        /* if delete key pressed */
        if (e.type === 'keydown') {
            $(e.target).fadeOut(300, () => {
                $(e.target).remove();

                if (!$('#tbl-employee>tbody>tr').length) $('#tbl-employee>tfoot').show();

            });
        }

        $('form').trigger('reset');

    } catch (e) {
        alert("Failed to delete the employee, try again");
        console.error(e);
    }
}

$('#tbl-employee>tbody').on('click', 'td:last-child > i', async (e) => {
    deleteEmployee(e);
});

$('#tbl-employee>tbody').on('keydown', (e) => {
    if (e.code === 'Delete') {
        deleteEmployee(e);
    } else if (e.code === 'ArrowUp') {
        e.target.previousElementSibling.focus();
        // loadEmpDetailsForUpdatingByArrowKeys(e);
    } else if (e.code === 'ArrowDown') {
        e.target.nextElementSibling.focus();
        // loadEmpDetailsForUpdatingByArrowKeys(e);
    }
});

/* ToDo : check this function logic */
async function loadEmpDetailsForUpdatingByArrowKeys(e) {
    const empId = e.code === 'ArrowDown' ? e.target.nextElementSibling.children[0].text : e.target.previousElementSibling.children[0].text;
    console.log(`empid selected by arrow key is ${empId}`);
    const response = await axios.get(`${API_URL}/${empId}`);
    if (response.status !== 200) {
        throw new Error(response.status + " " + response.data);
    }
    let employee = response.data;

    /* set details to fields */
    $('#txt-id').val(employee.id);
    $('#txt-name').val(employee.name);
    $('#txt-address').val(employee.address);
    if (employee.gender === 'male') {
        $('#rd-male').prop('checked', true);
    } else {
        $('#rd-female').prop('checked', true);
    }
    $('#cb-department').val(employee.department);

    isUpdating = true;
    rowClickedEvent = e;
    /*enable save button*/
    $('#btn-save').prop('disabled', false);
}

$('#tbl-employee>tbody').on('click', (e) => {
    loadEmpDetailsForUpdating(e);
});

async function loadEmpDetailsForUpdating(e) {
    const empId = $(e.target).parents('tr').children().first().text();
    const response = await axios.get(`${API_URL}/${empId}`);
    if (response.status !== 200) {
        throw new Error(response.status + " " + response.data);
    }
    let employee = response.data;

    /* set details to fields */
    $('#txt-id').val(employee.id);
    $('#txt-name').val(employee.name);
    $('#txt-address').val(employee.address);
    if (employee.gender === 'male') {
        $('#rd-male').prop('checked', true);
    } else {
        $('#rd-female').prop('checked', true);
    }
    $('#cb-department').val(employee.department);

    isUpdating = true;
    rowClickedEvent = e;
    /*enable save button*/
    $('#btn-save').prop('disabled', false);
}
