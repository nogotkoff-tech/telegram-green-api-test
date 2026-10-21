* Host generativelanguage.googleapis.com:443 was resolved.
* IPv6: (none)
* IPv4: 172.217.119.4
*   Trying 172.217.119.4:443...
* schannel: disabled automatic use of client certificate
* ALPN: curl offers http/1.1
* ALPN: server accepted http/1.1
* Established connection to generativelanguage.googleapis.com (172.217.119.4 port 443) from 172.18.0.1 port 49932 
  % Total    % Received % Xferd  Average Speed  Time    Time    Time   Current
                                 Dload  Upload  Total   Spent   Left   Speed
  0      0   0      0   0      0      0      0           00:01              0* using HTTP/1.x
> GET / HTTP/1.1
> Host: generativelanguage.googleapis.com
> User-Agent: curl/8.21.0
> Accept: */*
> 
* Request completely sent off
* schannel: remote party requests renegotiation
* schannel: renegotiating SSL/TLS connection
* schannel: SSL/TLS connection renegotiated
< HTTP/1.1 404 Not Found
< Content-Type: text/html
< Date: Wed, 21 Oct 2026 07:34:15 GMT
< Server: scaffolding on HTTPServer2
< Content-Length: 0
< X-XSS-Protection: 0
< X-Frame-Options: SAMEORIGIN
< X-Content-Type-Options: nosniff
< Server-Timing: gfet4t7; dur=7
< Alt-Svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
< 
  0      0   0      0   0      0      0      0           00:01              0  0      0   0      0   0      0      0      0           00:01              0  0      0   0      0   0      0      0      0           00:01              0
* Connection #0 to host generativelanguage.googleapis.com:443 left intact
