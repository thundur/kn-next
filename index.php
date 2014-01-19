<?php



// define constants
define('TEMPLATES_DIR', 'templates/');
define('SLIDESHOW_DIR', 'img/slideshow/');
define('AGENDA_JSON_FILE', '/tmp/kn-next_agenda.json');
define('FETCH_AGENDA_SCRIPT', __DIR__ . '/utils/fetch_agenda.py');


// include TWIG
require_once("vendor/autoload.php");

// build new Twig Environment
$twig = new Twig_Environment(new Twig_Loader_Filesystem(TEMPLATES_DIR), array(
	'auto_reload' => true,
	'strict_variables' => true,
	'autoescape' => false,
));

// add email obscurify function
$email_function = new Twig_SimpleFunction('email', function ($addr) {
	return '<script type="text/javascript">document.write("' . str_rot13($addr) . '".rot13())</script>
<noscript>(e-mailadres verborgen)</noscript>'; 
});
$twig->addFunction($email_function);

$get_slideshow_images_function = new Twig_SimpleFunction('get_slideshow_images', function() {
	$files = scandir(SLIDESHOW_DIR);
	$result = array();
	foreach($files as $file) {
		if( is_file(SLIDESHOW_DIR . $file) ) {
			array_push($result, $file);
		}
	}
	return $result;
});
$twig->addFunction($get_slideshow_images_function);

// create an empty $context, so extra values can be defined
$context = array();

// do page-specific tasks
$action = isset($_GET['action']) ? trim($_GET['action']) : '';
switch ($action) {
	case 'over':
		$template = 'over.twig';
		break;
	case 'geschiedenis':
		$template = 'geschiedenis.twig';
		break;
	case 'activiteiten':
		$template = 'activiteiten.twig';
		break;
	case 'bestuur':
		$action = 'bestuur10';
		$template = 'bestuur/bestuur10.twig';
		break;
	case 'aktanokturna':
		$template = 'aktanokturna.twig';
		$context['aktas'] = array();
		foreach(glob('aktas/Jaargang*') as $jaargang) {
			preg_match('/Jaargang ([0-9]+)/', $jaargang, $m);
			$context['aktas'][(int)$m[1]] = array(
				'name' => 'Jaargang '. $m[1],
				'aktas' => array(),
			);
			foreach(glob($jaargang .'/*\.pdf') as $akta) {
				preg_match('|/([^/]*)\.pdf|', $akta, $m2);
				$context['aktas'][$m[1]]['aktas'][] = array(
					'title' => $m2[1],
					'location' => $akta,
				);
			}
			if(count($context['aktas'][$m[1]]['aktas']) == 0) {
				unset($context['aktas'][$m[1]]);
			}
		}
		ksort($context['aktas']);
		$context['aktas'] = array_reverse($context['aktas']);
		break;
	case 'zusjes':
		$template = 'zusjes.twig';
		break;
	case 'sponsoren':
		$template = 'sponsoren.twig';
		break;
	case 'agenda':
		$template = 'agenda.twig';
		break;
	case 'lidworden':
		$template = 'lidworden.twig';
		break;
	case 'contact':
		$template = 'contact.twig';
		break;
	case 'index':
		$action = 'index';
		$template = 'index.twig';
		break;
	default:
		if(preg_match('/^bestuur([0-9]+)$/', $action, $m)) {
			if(file_exists(TEMPLATES_DIR .'bestuur/bestuur'. $m[1] .'.twig')) {
				$action = 'bestuur'. $m[1];
				$template = 'bestuur/bestuur'. $m[1] .'.twig';
			} else {
				$action = 'index';
				$template = 'index.twig';
			}
			break;
		} else {
			$action = 'index';
			$template = 'index.twig';
		}
		break;
}

$context['action'] = $action;
if($action == 'index' || $action == 'agenda') {
	$agenda_json = file_get_contents(AGENDA_JSON_FILE);
	if (! $agenda_json) {
		die('ERROR bij het laden van de agenda');
	}
	$context['agenda'] = json_decode($agenda_json);
}

$html = $twig->render($template, $context);

header('Content-Length: ' . strlen($html));
print $html;
