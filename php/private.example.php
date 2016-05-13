<?php
define("ITFORM_LOGIN", 'agent@kupikasko.com');
define("ITFORM_PASSWORD", '...');

//Удалите старый файл если изменили логин и пароль
//Измените имя файла вкотором храниться токен!!!
define("ITFORM_TOKEN_FILE", 'youbetterkeepitinsercet');

//Закоментируйте что бы спользовать mail();
function ItSetAuth($mail)
{
    $mail->isMail();
}