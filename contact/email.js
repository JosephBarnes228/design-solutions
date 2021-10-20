// Utilizes EmailJS library
const btn = document.getElementById('send-button');

document.getElementById('form').addEventListener('submit', function(event) {
   event.preventDefault();

   btn.value = 'Sending...';

   const serviceID = 'default_service';
   const templateID = 'template_3nnovn5';

   emailjs.sendForm(serviceID, templateID, this)
    .then(() => {
        btn.value = 'Send Email';
        Swal.fire({
            icon: 'success',
            title: 'Email sent!',
        })
    }, (err) => {
        btn.value = 'Send Email';
        alert(JSON.stringify(err));
    });
});
