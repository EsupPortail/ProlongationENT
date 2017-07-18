(function () {

    function dynamic_agenda_icon() {
        var img = h.simpleQuerySelector("#pE-header .pE-button img[src$='agenda.svg'");
        if (!img) return;
        
        var e = document.createElement("span");
        e.style = "display: inline-block";
        e.className = "icon";
        e.innerHTML = ""
 + '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" height="40px" viewBox="-453.618 -905.311 282.232 282.232">'
 + '<circle fill="#00326E" cx="-312.503" cy="-764.195" r="141.116"/>'
 + '<path opacity="0.1" fill="#FFFFFF" d="M-185.512-825.808c9.05,18.617,14.126,39.522,14.126,61.612   c0,77.938-63.178,141.117-141.111,141.117c-77.932,0-141.108-63.18-141.108-141.117c0-19.484,3.949-38.045,11.089-54.928"/>'
 + '<path fill="#FFFFFF" d="M-448.742-821.5v-8.232h8.232v8.232H-448.742z"/>'
 + '<path fill="#FFFFFF" d="M-432.072-821.5v-8.232h8.232v8.232H-432.072z"/>'
 + '<path fill="#FFFFFF" d="M-415.402-821.5v-8.232h8.232v8.232H-415.402z"/>'
 + '<path fill="#FFFFFF" d="M-398.732-821.5v-8.232h8.232v8.232H-398.732z"/>'
 + '<path fill="#FFFFFF" d="M-382.063-821.5v-8.232h8.232v8.232H-382.063z"/>'
 + '<path fill="#FFFFFF" d="M-365.393-821.5v-8.232h8.232v8.232H-365.393z"/>'
 + '<path fill="#FFFFFF" d="M-348.723-821.5v-8.232h8.232v8.232H-348.723z"/>'
 + '<path fill="#FFFFFF" d="M-332.053-821.5v-8.232h8.232v8.232H-332.053z"/>'
 + '<path fill="#FFFFFF" d="M-315.383-821.5v-8.232h8.232v8.232H-315.383z"/>'
 + '<path fill="#FFFFFF" d="M-298.713-821.5v-8.232h8.232v8.232H-298.713z"/>'
 + '<path fill="#FFFFFF" d="M-282.043-821.5v-8.232h8.232v8.232H-282.043z"/>'
 + '<path fill="#FFFFFF" d="M-265.373-821.5v-8.232h8.232v8.232H-265.373z"/>'
 + '<path fill="#FFFFFF" d="M-248.703-821.5v-8.232h8.232v8.232H-248.703z"/>'
 + '<path fill="#FFFFFF" d="M-232.033-821.5v-8.232h8.232v8.232H-232.033z"/>'
 + '<path fill="#FFFFFF" d="M-215.363-821.5v-8.232h8.232v8.232H-215.363z"/>'
 + '<path fill="#FFFFFF" d="M-198.693-821.5v-8.232h8.232v8.232H-198.693z"/>'
 + '<path fill="#FFFFFF" d="M-384.924-804.736v-41.441h12.211v41.441H-384.924z"/>'
 + '<path fill="#FFFFFF" d="M-250.757-804.736v-41.441h12.211v41.441H-250.757z"/>'
 + '<text id="day" x="-314" y="-700" font-family="Arial" font-size="117" fill="#FFFFFF" text-anchor="middle">' + new Date().getDate() + '</text>'
 + '</svg>';
        img.parentElement.replaceChild(e, img);
    }

    var plugin = {
        post_header_add: dynamic_agenda_icon
    };
    pE.plugins.push(plugin);   
})();
