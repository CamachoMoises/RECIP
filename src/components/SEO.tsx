import { Helmet } from 'react-helmet-async';

type SEOProps = {
	title: string;
	description?: string;
	canonical?: string;
	image?: string;
	url?: string;
	type?: 'website' | 'article';
	publishedTime?: string;
	author?: string;
	noindex?: boolean;
};

const SITE_NAME = 'R.E.C.I.P. - Registro de Evaluación, Capacitación e Instrucción del Piloto';
const DEFAULT_DESCRIPTION =
	'Sistema de gestión de evaluación, capacitación e instrucción para pilotos de aviación. Gestión de cursos, exámenes y evaluaciones FSTD/ATD.';
const DEFAULT_URL = 'https://www.cea360recip.com';
const DEFAULT_IMAGE = '/images/logo.png';

export default function SEO({
	title,
	description = DEFAULT_DESCRIPTION,
	canonical,
	image = DEFAULT_IMAGE,
	url,
	type = 'website',
	publishedTime,
	author,
	noindex = false,
}: SEOProps) {
	const fullTitle = `${title} | ${SITE_NAME}`;
	const pageUrl = url ? `${DEFAULT_URL}${url}` : DEFAULT_URL;
	const canonicalUrl = canonical || pageUrl;

	return (
		<Helmet>
			<title>{fullTitle}</title>
			<meta name="description" content={description} />

			{noindex && <meta name="robots" content="noindex, nofollow" />}
			<link rel="canonical" href={canonicalUrl} />

			<meta property="og:type" content={type} />
			<meta property="og:title" content={fullTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:url" content={canonicalUrl} />
			<meta property="og:site_name" content={SITE_NAME} />
			<meta property="og:image" content={image} />
			<meta property="og:locale" content="es_ES" />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={fullTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={image} />

			{publishedTime && (
				<meta property="article:published_time" content={publishedTime} />
			)}
			{author && <meta name="author" content={author} />}

			<script type="application/ld+json">
				{JSON.stringify({
					'@context': 'https://schema.org',
					'@type': type === 'article' ? 'Article' : 'WebSite',
					name: fullTitle,
					description,
					url: canonicalUrl,
					image,
					...(type === 'article' && publishedTime
						? { datePublished: publishedTime, author: { '@type': 'Person', name: author } }
						: {}),
				})}
			</script>
		</Helmet>
	);
}
