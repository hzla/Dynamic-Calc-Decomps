const G7_VARIANTS = {
    SM: {
        generation: 7,
        detectedGame: 'SM',
        expectedBaseGame: 'g7',
        saveSize: 0x6BE00,
        metadataOffset: 0x6BC00,
        boxCount: 32,
        checksum: g67CRC16Invert,
        locationResolver: resolveGen7MetLocationName,
        requiredBlocks: {
            party: { id: 4, offset: 0x01400, length: 0x061C },
            boxLayout: { id: 13, offset: 0x04800, length: 0x05E6 },
            boxes: { id: 14, offset: 0x04E00, length: 0x36600 }
        }
    },
    USUM: {
        generation: 7,
        detectedGame: 'USUM',
        expectedBaseGame: 'g7',
        saveSize: 0x6CC00,
        metadataOffset: 0x6CA00,
        boxCount: 32,
        checksum: g67CRC16Invert,
        locationResolver: resolveGen7MetLocationName,
        requiredBlocks: {
            party: { id: 4, offset: 0x01600, length: 0x061C },
            boxLayout: { id: 13, offset: 0x04C00, length: 0x05E6 },
            boxes: { id: 14, offset: 0x05200, length: 0x36600 }
        }
    }
};

$(document).ready(function () {
    if (window.baseGame !== 'g7' && (typeof settings === 'undefined' || settings.damageGen != 7)) {
        return;
    }

    $('#read-save').off('click.g7save').on('click.g7save', function () {
        if ($('#save-upload').length > 0) {
            $('#save-upload')[0].value = null;
        }
    });

    const saveInput = document.getElementById('save-upload');
    if (!saveInput) {
        return;
    }

    saveInput.addEventListener('change', function (event) {
        if (!g67ShouldHandleSaveUpload(7, 'g7')) {
            return;
        }

        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const selectedName = ($('#save-upload').val() || '').split('\\').pop() || file.name || 'save.sav';
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const result = parseGen7Save(e.target.result);
                saveUploaded = true;
                saveFileName = selectedName;
                savExt = ((selectedName.split('.').pop()) || '').toLowerCase();
                g67ShowLoadSuccess(selectedName, result.detectedGame);
                if (typeof window.applyImportedSnapshot === 'function') {
                    window.applyImportedSnapshot({
                        showdownImport: result.showdownImport,
                        deadMons: result.deadMons || [],
                        source: 'save-file',
                        replaceDeadMons: true
                    });
                } else {
                    $('.import-team-text').val(result.showdownImport);
                    $('#import').click();
                }
            } catch (err) {
                $('.import-team-text').val('');
                console.error('Failed to parse Gen 7 save file.', err);
                alert('Unable to parse this save. Only raw Sun/Moon and Ultra Sun/Ultra Moon .sav files are supported right now.');
            }
        };

        reader.readAsArrayBuffer(file);
    });
});

function parseGen7Save(arrayBuffer) {
    return g67ParseSaveFile(arrayBuffer, G7_VARIANTS);
}
