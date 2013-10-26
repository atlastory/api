
# https://help.ubuntu.com/community/PostgreSQL

# set up postgres
POSTGRES_VERSION=9.1 # you may need to change this
POSTGIS_VERSION="2.1.0" # you may need to change this
POSTGIS_VERSION2="2.1"
sudo apt-get install -y postgresql postgresql-server-dev-$POSTGRES_VERSION postgresql-$POSTGRES_VERSION-postgis

# Install PostGIS dependencies
sudo apt-get install -y libgeos-dev libjson0-dev
# http://trac.osgeo.org/geos/
wget http://download.osgeo.org/geos/geos-3.4.2.tar.bz2
tar xjf geos-3.4.2.tar.bz2
cd geos-3.4.2
./configure && make && sudo make install
cd ..
# http://trac.osgeo.org/gdal/wiki/DownloadSource
wget http://download.osgeo.org/gdal/1.10.1/gdal-1.10.1.tar.gz
tar xvfz gdal-1.10.1.tar.gz
cd gdal-1.10.1
./configure && make && sudo make install
cd ..
# https://github.com/json-c/json-c/releases
# Use 0.10
wget https://github.com/json-c/json-c/archive/json-c-0.10-20120530.tar.gz
tar xvfz json-c-0.10-20120530.tar.gz
cd json-c-0.10-20120530
./configure && make && sudo make install
cd ..

# Install most recent PostGIS
# http://postgis.net/source
wget http://download.osgeo.org/postgis/source/postgis-$POSTGIS_VERSION.tar.gz
tar xvfz postgis-$POSTGIS_VERSION.tar.gz
cd postgis-$POSTGIS_VERSION
./configure
make && sudo make install

sudo -u postgres psql template1
# \password postgres
# <<ENTER NEW PASSWORD>>
# ctrl-d

sudo -u postgres createuser --superuser root
sudo -u postgres psql
# \password root
# <<ENTER NEW PASSWORD>>
# ctrl-d
createdb root
psql

# Creates postgis database
createdb postgis
createlang plpgsql postgis
POSTGIS_PATH=`pg_config --sharedir`/contrib/postgis-$POSTGIS_VERSION2
psql -d postgis -f $POSTGIS_PATH/postgis.sql
psql -d postgis -f $POSTGIS_PATH/spatial_ref_sys.sql
psql -d postgis -f $POSTGIS_PATH/rtpostgis.sql
sudo -u postgres psql -d postgis -f ""

sudo /etc/init.d/postgresql start

psql postgis

# Edit /etc/postgresql/9.1/main/postgresql.conf
# uncomment "listen_addresses		'*'"
# Edit /etc/postgresql/9.1/main/pg_hba.conf
# add line: "host   all   all   0.0.0.0/0    md5"
# add line: "local  all   all                md5"
# delete line: "local postgres ..."
# sudo /etc/init.d/postgresql restart


# If PostGIS doesn't work (json-c problem) add this
# to /configure.au ~line 750

        if test "x$JSONDIR" = "xyes"; then
                 AC_MSG_ERROR([you must specify a parameter to --with-jsondir, e.g. --with-jsondir=/path/to])

                dnl We need (libjson[-c].so OR libjson[-c].dylib OR libjson[-c].dll OR libjson[-c].a) AND json[-c]/json.h
                if test ! \( -e "${JSONDIR}/include/json-c/json.h" -o \
                -e "${JSONDIR}/include/json/json.h" \)
                        ! \( -e "${JSONDIR}/lib/libjson-c.so" -o \
                -e "${JSONDIR}/lib/libjson.so" -o \
                -e "${JSONDIR}/lib/libjson-c.dll" -o \
                             -e "${JSONDIR}/lib/libjson.dll" -o \
                -e "${JSONDIR}/lib/libjson-c.dylib" -o \
                             -e "${JSONDIR}/lib/libjson.dylib" -o \
                -e "${JSONDIR}/bin/libjson-c.dll" -o \
                             -e "${JSONDIR}/bin/libjson.dll" -o \
                -e "${JSONDIR}/lib/libjson-c.a"
                             -e "${JSONDIR}/lib/libjson.a" \)
                 then
                        AC_MSG_ERROR([Cannot find json-c dev files in "$JSONDIR"])
                 fi
                 AC_MSG_RESULT([Using user-specified json-c directory: $JSONDIR])

                 dnl Add the include directory to JSON_CPPFLAGS
                 JSON_CPPFLAGS="-I$JSONDIR/include"
                JSON_LDFLAGS="-L$JSONDIR/lib -ljson-c -ljson"
         fi


dnl Check that we can find the json[-c]/json.h header file
 CPPFLAGS_SAVE="$CPPFLAGS"
 CPPFLAGS="$JSON_CPPFLAGS"
AC_CHECK_HEADERS([json-c/json.h json/json.h], [HAVE_JSON=yes], [])
 CPPFLAGS="$CPPFLAGS_SAVE"

dnl Ensure we can link against json-c
 LIBS_SAVE="$LIBS"
 LIBS="$JSON_LDFLAGS"
AC_SEARCH_LIBS([json_object_get], [json-c json], [HAVE_JSON=yes], [], [])
 LIBS="$LIBS_SAVE"

 if test "$HAVE_JSON" = "yes"; then
        AC_DEFINE([HAVE_LIBJSON], 1, [Define to 1 if json-c is present])
     if test "x$JSON_LDFLAGS" = "x"; then
        JSON_LDFLAGS="-ljson-c -ljson"
     fi
 fi