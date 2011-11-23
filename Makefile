APPID=com.whitm.suborbital

build: clean
	echo "Building target: ${APPID}"
	palm-package -X exclude.txt *.package *.application *.service
	ar -q ${APPID}_*.ipk pmPostInstall.script
	ar -q ${APPID}_*.ipk pmPreRemove.script
	
install: build
	echo "Installing target: ${APPID}"
	palm-install ${APPID}_*.ipk

clean:
	echo "Cleaning target: ${APPID}"
	rm -rf *.ipk

test: install
	echo "Running target: ${APPID}"
	palm-launch ${APPID}
