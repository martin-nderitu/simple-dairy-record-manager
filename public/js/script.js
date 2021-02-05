const config = {
    altInput: true,
    altFormat: "D M d Y",
    dateFormat: "Z",
    maxDate: "today"
}

const options = {
    altInput: true,
    altFormat: "D M d Y",
    // dateFormat: "Z"
}

flatpickr("#from", config);
flatpickr("#to", config);

flatpickr("#_from", options);
flatpickr("#_to", options);

setTimeout(function () {
    $(".alert").alert("close");
}, 5000);
