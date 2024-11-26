startTime();
const username = (new URLSearchParams(window.location.search)).get('user');
var apiKey = "e8d5900f153e285520e5c7ab178111ee";
var recentTrackURL = "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=" + username + "&limit=5"  + "&extended=1" + "&api_key=" + apiKey + "&format=json";
var URL = "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=" + username + "&api_key=" + apiKey + "&format=json";

var intervalleRechercheNouveauScrobble;
var intervalleMiseAJourNombreEcoute;
var chansonAffichee = "null";
var artisteAffiche = "null";
var albumAffiche = "null";
var UrlChanson = "null";
var trackPlayCount = -1;
var trackPlayCountDisplayed;
var artistPlayCountDisplayed;
var albumPlayCountDisplayed;
var nowPlaying = "null";
var total = 0;

var userURL = "https://www.last.fm/user/" + username;

var i = 0;

const emojiTrack = setSpanEmoji("🎵");
const emojiArtist = setSpanEmoji("🎤");
const emojiAlbum = setSpanEmoji("💿");
const emojiNew = setSpanEmoji("🔥", "color:lightgreen");
const emojiNull = setSpanEmoji("⚠");
const albumWankil = setSpanEmoji("🍌", "color:yellow");
const emojiLiveOn = setSpanEmoji("🟢", "color:green");
const emojiLiveOff = setSpanEmoji("🕑");
const emojiLoved = setSpanEmoji("❤", "color:red");
const emojiTotal = setSpanEmoji("🔀");
var isTabActive;

intervalleRechercheNouveauScrobble = setInterval(function() {getJsonResponse()},1500); // appelle la fonction getJsonResponse toutes 1,5 secondes
intervalleArtistPlayCount = setInterval(function() {updateArtistPlayCount()},5000); // appelle la fonction updateArtistPlayCount toutes les 5 secondes
intervalleAlbumPlayCount = setInterval(function() {updateAlbumPlayCount()},5000); // appelle la fonction updateAlbumPlayCount toutes les 5 secondes

/**
 * Envoi et recoit la requete XML HTTP "user.getrecenttracks", et obtient les
 * données sur le scrobble le plus récent avec la fonction interne getScobbleInfo(json)
 */
function getJsonResponse(){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			getScobbleInfo(this);
		} else if (this.status == 500 && this.readyState == 4){
			updateDataError();
			console.warn(i + " / " + new Date() + " / state : "+this.readyState + " / status : " + this.status);
		}
		i++;
	};

	var urlReq = recentTrackURL;
	xhttp.open("GET", recentTrackURL, true);
	xhttp.send();

	/**
	 * Obtient les données sur le scrobble le plus récent
	 * @param {XMLHttpRequest} xml - La requete XMLHttp sur la requete "user.getrecenttracks"
	 */
	function getScobbleInfo(json) {
		const currentTrackJson = JSON.parse(json.response).recenttracks.track[0];
		
		var currArtist = currentTrackJson.artist["name"];
		var currArtistUrl = currentTrackJson.artist["url"];
		var currTrack = currentTrackJson.name;
		var currTrackUrl = currentTrackJson.url;
		var currAlbum = currentTrackJson.album["#text"];
		var currImage = currentTrackJson.image[3]["#text"];
		var currURL = currentTrackJson.url;
		var currLoved = currentTrackJson.loved;
		var currNowPlaying = getNowPlaying(currentTrackJson);
		total = JSON.parse(json.response).recenttracks["@attr"].total;


		if (currAlbum == "" && currArtist == "Wankil Studio - Laink et Terracid"){
			updateData(currTrack, currArtist, albumWankil, "pic/wankil-cover.jpg", currURL, currNowPlaying);
			updateTrackPlayCount(currTrack, currArtist, albumWankil, "pic/wankil-cover.jpg", currURL, currLoved);
		} else if (currAlbum == ""){
			updateData(currTrack, currArtist, emojiNull, "pic/pas-dalbum.png", currURL, currNowPlaying);
			updateTrackPlayCount(currTrack, currArtist, emojiNull, "pic/pas-dalbum.png", currURL, currLoved);
		} else {
			updateData(currTrack, currArtist, currAlbum, currImage, currURL, currNowPlaying);
			updateTrackPlayCount(currTrack, currArtist, currAlbum, currImage, currURL, currLoved);
			//updateAlbumPlayCount(currArtist, currAlbum);
		}
	}
}

getJsonResponse();

/** 
 * Return "true" si scrobble en cours, sinon retourne la date du dernier scrobble
 * @param {object} currentTrackJson - L'objet Json de la track courante
 */
function getNowPlaying(currentTrackJson) {
	if (currentTrackJson["@attr"] == undefined) {
		var options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
		var options2 = {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
		const dateMilli = Number(currentTrackJson.date.uts) * 1000;
		return (new Date(dateMilli)).toLocaleDateString("fr-FR", options2);
	} else {
		return "true";
	}
}

/**
 * Met à jour la page avec le titre, l'artiste, l'album et la pochette de la
 * chanson Mets à jour les variables chansonAffichee, artisteAffiche et
 * UrlChanson
 * @param {string} newTrack - Le titre de la chanson en cours
 * @param {string} newArtist - L'artiste de la chanson en cours
 * @param {string} newAlbum - L'album de la chanson en cours
 * @param {string} newImage - La pochette de la chanson en cours
 * @param {string} newUrl - L'url de la chanson en cours
 */
function updateData(newTrack, newArtist, newAlbum, newImage, newUrl, newNowPlaying){
	if (chansonAffichee != newTrack || artisteAffiche != newArtist || albumAffiche != newAlbum){
		chansonAffichee = newTrack; 
		artisteAffiche = newArtist;
		albumAffiche = newAlbum;
		trackPlayCount = -1;
		trackPlayCountDisplayed = -1;
		UrlChanson = newUrl;
		document.getElementById("image").innerHTML = "<img src=" + newImage + ">";
		document.getElementById("track").innerHTML = "<a class=\"ecouteTrack\" title=" + newUrl + "  href=" + newUrl + ">" + emojiTrack + "</a> " + newTrack; 
		document.getElementById("artist").innerHTML = "<a href=" + getArtistUrl(newArtist) + ">" + emojiArtist + "</a> " + newArtist;
		if (newAlbum != albumWankil && newAlbum != emojiNull){
			document.getElementById("album").innerHTML = "<a href=" + getAlbumUrl(newArtist, newAlbum) + ">" + emojiAlbum + "</a> " + cleanText(newAlbum);
		} else {
			document.getElementById("album").innerHTML = emojiAlbum + " " + newAlbum;
		}
		document.title = newArtist + " - " + newTrack + " -- Scrobbling now";
	}
	getTrackPlaycount(chansonAffichee, artisteAffiche);
	showNowPlaying(newNowPlaying);
}

function updateDataError(){
	chansonAffichee = setSpanEmoji(" 💤 💣 💥 🙁 🫠"); 
	artisteAffiche = setSpanEmoji(" 😱 😡 😤 💀");
	albumAffiche = setSpanEmoji(" 👁 🐢 🌵 🌟 😶‍🌫️ 🫥 👀");
	document.getElementById("image").innerHTML = "<a title=\"maxres\" href=\"lastfm-cover.html\"><img src=" + "pic/wave-300-300-2.png" + "></img></a>";
	document.getElementById("track").innerHTML = emojiTrack + " # Error #" + chansonAffichee; 
	document.getElementById("artist").innerHTML = emojiArtist + " # Error #" + artisteAffiche;
	document.getElementById("album").innerHTML = emojiAlbum + " # Error #" + albumAffiche;
	document.title = "LastFm Error" + " -- Scrobbling now";
}

function showNowPlaying(newNowPlaying) {
	if (newNowPlaying != nowPlaying) {
		if (newNowPlaying == "true") {
			document.getElementById("nowPlaying").innerHTML = emojiLiveOn;
		} else {
			document.getElementById("nowPlaying").innerHTML = emojiLiveOff + " " + newNowPlaying;
		}
		nowPlaying = newNowPlaying;
	}
}

/**
 * Renvoi l'url avec la résolution max de l'url reçue en paramètre
 * @param  {string} urlImage - l'url de l'image en 300x300
 * @return {string}          - l'url de l'image avec la qualité de résolution max
 */
function getImageMaxRes(urlImage){
	var debutURL = "https://lastfm.freetls.fastly.net";
	var url;
	if (urlImage.includes(debutURL)){
		var url = urlImage.substr(46, 36); //coupe l'url, à partir du charactère 46, et pour une longueur de 36
		url = "https://lastfm.freetls.fastly.net/i/u/max/" + url;
	} else {
		url = urlImage; //si l'url de l'image ne vient pas de lastfm, renvoi l'url en parametre
	}
	return url;
}

/**
 * Renvoi l'url de la page de l'artiste
 * @param  {string} artistName - le nom de l'artiste
 * @return {string}            - l'url de la page LastFm de l'artiste
 */
function getArtistUrl(artistName){
	var nomArtistSansEspace = artistName.replaceAll(" ", "+");
	return "https://www.last.fm/music/"+encodeURIComponent(nomArtistSansEspace);
}

/**
 * Renvoi l'url de la page de l'artiste
 * @param  {string} artistName - le nom de l'artiste
 * @return {string}            - l'url de la page LastFm de l'artiste
 */
function getAlbumUrl(artistName, albumName){
	var nomAlbumSansEspace = albumName.replaceAll(" ", "+");
	var artistUrl = getArtistUrl(artistName);
	var urlAlbum =  artistUrl + "/" + encodeURIComponent(nomAlbumSansEspace);
	return urlAlbum;
}

function cleanText(text) {
	var textclean = text.replaceAll("<", "&lt;");
	var textclean = textclean.replaceAll(">", "&gt;");
	return textclean;
}

/** Track Play Count **/

function updateTrackPlayCount(){
	if (artisteAffiche != "null" && chansonAffichee != "null"){
		getTrackPlaycount(newTrack, newArtist);
	} else {
		console.warn("updateTrackPlayCount() null : "+artisteAffiche + " - " + chansonAffichee);
	}
}

function getTrackPlaycount(trackName, artistName){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			trackPlayCount = getTrackPlaycountBis(this)
		}
	};

	var trackEncode = encodeURIComponent(trackName);
	var artistEncode = encodeURIComponent(artistName);

	var urlReq = "https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key="+ apiKey + "&username=" + username + "&artist=" + artistEncode + "&track=" + trackEncode + "&format=json";
	xhr.open("GET", urlReq, true);
	xhr.send();
}

function getTrackPlaycountBis(json){
	const currentTrackPlayCountJson = JSON.parse(json.response);
	var playcount = -2;
	if (json.readyState === XMLHttpRequest.DONE) {
		if (currentTrackPlayCountJson.track != undefined) {
		var xPlayCountTrack = currentTrackPlayCountJson.track.userplaycount
		playcount = xPlayCountTrack;
		}
	} else {
      console.warn("getTrackPlaycountBis() erreur : json.readyState = " + json.readyState + " / json.status = " + json.status);
    }
    return playcount;
}

/**
 * Met à jour la page avec le nombre d'écoute
 * Mets à jour la variable trackPlayCountDisplayed
 * @param {string} newTrack - Le titre de la chanson en cours
 * @param {string} newArtist - L'artiste de la chanson en cours
 * @param {string} newAlbum - L'album de la chanson en cours
 * @param {string} newImage - La pochette de la chanson en cours
 * @param {string} newUrl - L'url de la chanson en cours
 */
function updateTrackPlayCount(newTrack, newArtist, newAlbum, newImage, newUrl, newLoved){
	if (trackPlayCount == undefined || trackPlayCount > 0){
		if (trackPlayCount >= 50 && trackPlayCount < 100){
			document.getElementById("track").innerHTML = "<a class=\"ecouteTrack\" title=" + newUrl + "  href=" + newUrl + ">" + emojiTrack + "</a> " + newTrack + " <span>(<a href="+userURL+">" + trackPlayCount + " " + setSpanEmoji("✨") + "</a>)</span>"; 
		} else if (trackPlayCount >= 100 & trackPlayCount < 150){
			document.getElementById("track").innerHTML = "<a class=\"ecouteTrack\" title=" + newUrl + "  href=" + newUrl + ">" + emojiTrack + "</a> " + newTrack + " <span>(<a href="+userURL+">" + trackPlayCount + " " + setSpanEmoji("💯") + "</a>)</span>"; 
		} else if (trackPlayCount >= 150){
			document.getElementById("track").innerHTML = "<a class=\"ecouteTrack\" title=" + newUrl + "  href=" + newUrl + ">" + emojiTrack + "</a> " + newTrack + " <span>(<a href="+userURL+">" + trackPlayCount + " " + setSpanEmoji("🏆") + "</a>)</span>"; 
		} else {
			document.getElementById("track").innerHTML = "<a class=\"ecouteTrack\" title=" + newUrl + "  href=" + newUrl + ">" + emojiTrack + "</a> " + newTrack + " <span>(<a href="+userURL+">" + trackPlayCount + "</a>)</span>"; 
		}
	} else {
		document.getElementById("track").innerHTML = "<a class=\"ecouteTrack\" title=" + newUrl + "  href=" + newUrl + ">" + emojiTrack + "</a> " + newTrack + " <span>(<a href="+userURL+">" + emojiNew + "</a>)</span>"; 
	}
	trackPlayCountDisplayed = trackPlayCount;
	setLove(newLoved);
	document.getElementById("total").innerHTML = emojiTotal + " " + total;
}

function setLove(isLoved) {
	if (isLoved == 1) {
		document.getElementById("track").innerHTML = document.getElementById("track").innerHTML + " " + emojiLoved;
	}
}

function setSpanEmoji(emoji, style){
	if (style != undefined) {
		return "<span class=" + "emoji" + " style="+style+" >" + emoji +"</span>";
	}
	return "<span class=" + "emoji" + ">" + emoji +"</span>";
}

/** Artist Play Count **/

function updateArtistPlayCount(){
	if (artisteAffiche != "null"){
		getArtistPlaycount(artisteAffiche);
	} else if (isTabActive) {
		console.warn("updateArtistPlayCount() null : "+artisteAffiche);
	}
}

function getArtistPlaycount(artistName){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			artistPlayCount = getArtistPlaycountBis(this)
		}
	};

	var artistEncode = encodeURIComponent(artistName);

	var urlReq = "https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&api_key="+ apiKey + "&username=" + username + "&artist=" + artistEncode + "&format=json";
	xhr.open("GET", urlReq, true);
	xhr.send();
}

function getArtistPlaycountBis(json){
	const currentArtistPlayCountJson = JSON.parse(json.response);
	var playcount = -2;
	if (json.readyState === XMLHttpRequest.DONE) {
		if (currentArtistPlayCountJson.artist != undefined) {
			var xPlayCountArtist = currentArtistPlayCountJson.artist.stats.userplaycount
			playcount = xPlayCountArtist;
			updateArtistPlayCountDisplayed(playcount)
		}
	} else {
      console.warn("getArtistPlaycountBis() erreur : json.readyState = " + json.readyState + " / json.status = " + json.status);
    }
    return playcount;
}

/**
 * Met à jour la page avec le nombre d'écoute de l'Artiste
 * Mets à jour la variable trackArtistCountDisplayed
 * @param {string} newArtist - L'artiste de la chanson en cours
 */
function updateArtistPlayCountDisplayed(artistPlayCount){
	document.getElementById("artist").innerHTML = "<a href=" + getArtistUrl(artisteAffiche) + ">" + emojiArtist + "</a> " + artisteAffiche + " <span>(" + artistPlayCount + ")</span>";
	artistPlayCountDisplayed = artistPlayCount;
}

/** Album Play Count **/

function updateAlbumPlayCount(){
	if (albumAffiche != "null"){
		getAlbumPlaycount(albumAffiche);
	} else if (isTabActive) {
		console.warn("updateAlbumPlayCount() null : "+albumAffiche);
	}
}

function getAlbumPlaycount(albumName){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			albumPlayCount = getAlbumPlaycountBis(this)
		}
	};

	var artistEncode = encodeURIComponent(artisteAffiche);
	var albumEncode = encodeURIComponent(albumName);

	var urlReq = "https://ws.audioscrobbler.com/2.0/?method=album.getInfo&api_key="+ apiKey + "&username=" + username + "&artist=" + artistEncode + "&album=" + albumEncode + "&format=json";
	xhr.open("GET", urlReq, true);
	xhr.send();
}

function getAlbumPlaycountBis(json){
	const currentAlbumPlayCountJson = JSON.parse(json.response);
	var playcount = -2;
	if (json.readyState === XMLHttpRequest.DONE) {
		if (currentAlbumPlayCountJson.album != undefined) {
			var xPlayCountAlbum = currentAlbumPlayCountJson.album.userplaycount
			playcount = xPlayCountAlbum;
			updateAlbumPlayCountDisplayed(playcount)
		}
	} else {
      console.warn("getAlbumPlaycountBis() erreur : json.readyState = " + json.readyState + " / json.status = " + json.status);
    }
    return playcount;
}

/**
 * Met à jour la page avec le nombre d'écoute de l'Album
 * Mets à jour la variable trackAlbumCountDisplayed
 * @param {string} newAlbum - L'album de la chanson en cours
 */
function updateAlbumPlayCountDisplayed(albumPlayCount){
	document.getElementById("album").innerHTML = "<a href=" + getAlbumUrl(artisteAffiche, albumAffiche) + ">" + emojiAlbum + "</a> " + cleanText(albumAffiche) + " <span>(" + albumPlayCount + ")</span>";
	albumPlayCountDisplayed = albumPlayCount;
}

/** Focus **/

window.onfocus = function () { 
  isTabActive = true; 
}; 

window.onblur = function () { 
  isTabActive = false; 
};

/** onClick **/

/**
 * Update le nombre d'écoute de l'artiste et de l'album
 * et sépare les appels api de 0.75 seconde
 */
function updatePlaycounts(param) {
	updateArtistPlayCount();
	setTimeout(updateAlbumPlayCount, 750);
}

/**
 * Au clic sur la page, appel pour update les playcounts
 */
document.body.addEventListener('click', function(e){
	updatePlaycounts()
});
document.addEventListener('keydown', function(e){
	if (e.key === ' ') {
		updatePlaycounts();
	}	
});


/** HORLOGE **/

/**
 * Ajoute un 0 devant le nombre si la paramètre est inférieur à 10
 * @param {Number} i - le nombre auquel il faut ajouter ou pas un 0
 * @return {Number] - le nombre avec 2 chiffres
 */
function checkTime(i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}

/**
 * Affiche l'heure sur l'élément 'time' de la page
 */
function startTime() {
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds();
	// add a zero in front of numbers<10
	h = checkTime(h);
	m = checkTime(m);
	s = checkTime(s);
	document.getElementById('time').innerHTML = "‧" + h + ":" + m + ":" + s + "‧";
	t = setTimeout(function() {
		startTime()
	}, 500);
}
