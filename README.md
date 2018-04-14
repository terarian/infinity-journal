# infinity-journal
Simulates an unlimited Travel Journal across all characters with multiclient
support.  
This module is a rewrite based heavily on [pinkipi](https://github.com/pinkipi)
's module with the same name.

# dependency
This module requires the most up-to-date
[command](https://github.com/ayylmar/command) module to work. Optional
dependency is the [ui](https://github.com/pinkipi/ui) module, which allows an
ingame WebUI to use the module. Both of these modules should be bundled with the
latest proxy releases.

# known issue when using quick-load
After being teleported to your destination, sometimes it might occur that your
client and server location do not match, in which case using skills, items or
anything is not advised. You can fix this issue by either jumping or moving with
your WASD keys a little.

# details
To disable/enable:  
**!journal**

To open the ingame webui:  
**!journal ui/webui**

To add new entries:  
**!journal Name**  
**!journal Province:Name**  

Deleting entries works as normal. Server entries are marked with an asterisk (*)
after their Province. 

You must have 4 or less server-side Travel Journal entries to add custom
locations, and must have Elite to teleport to custom locations.
