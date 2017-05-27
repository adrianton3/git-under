git-under
=========

Basic git client in JavaScript created for educational purposes.

Supports:

+ `init`
+ `add <path/to/file.txt>`
+ `commit <message>`
+ `cat-file <type> <hash>`
+ `log`
+ `branch [name]`
+ `checkout <branch|hash>`
+ `push <url>` - pushing also requires the NDR_USERNAME and NDR_PASSWORD
environment variables to hold the credentials for the remote repository
+ `objects-delta <descendant-hash> <ancestor-hash>` - computes the difference
of objects reachable from two commits. This is used to push data upstream.

See the scripts in *tools* for use examples.

Objects follow the git format; index and HEAD do not.

Loosely follows previous efforts like [pygit](https://github.com/benhoyt/pygit)
and [gitlet](https://github.com/maryrosecook/gitlet).