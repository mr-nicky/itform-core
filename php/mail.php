<?php
require_once 'src/init.php';
if (OPTIONS_REQUEST) {
    exit(0);
}

require_once 'settings.php';
require_once 'src/mail.classes.php';

class FnCalledAuthSettings implements AuthSettings
{
    /**
     * @param $mail PHPMailer
     */
    function setUpAuth($mail)
    {
        if (function_exists('IsSetAuth')) {
            ItSetAuth($mail);
        } else {
            $mail->isMail();
        }
    }
}

$authSettings = new FnCalledAuthSettings();

if (ITFORM_DEBUG && $_REQUEST['testmail']) {
    $useMail = $_REQUEST['method'] === 'mail';
    $mailFactory = new MailFactory($authSettings);
    $mail = $mailFactory->createMail();
    $mail->addAddress($_REQUEST['testmail']);
    $mail->Body = 'Hello from itform email';
    ItSetUpMail($mail);
    echo "<pre>";

    if ($mail->send()) {
        echo 'sent';
    } else {
        echo 'error';
    }
    echo "\n\n";
    var_dump($mail);
    echo "</pre>";
    exit(0);
}

$mailFactory = new MailFactory($authSettings);
$json = json_decode(file_get_contents('php://input'));
ItSetUpMailData($json);

$mail = $mailFactory->createMail();
ItSetUpMail($mail);
ItSetUpBody($json, $mail);
if ($mail->send()) {
    echo 'sent';
} else {
    echo 'error';
}

    if (ITFORM_DEBUG) {
        echo "<pre>";
        var_dump($mail);
        echo "</pre>";
    }
