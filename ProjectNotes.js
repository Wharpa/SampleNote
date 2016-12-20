var projectNotes = (function () {
    var newNote = false;
    var _addNoteTypeModal = function (params) {
        //show the loading animation
        $('.projectNotesDialog').empty().append('<p align="center"><img id="LoadingSpinner" src="@Url.Content("~/Content/themes/my/img/LoadingSpinner.gif")" /></p>');
        var customParams = {
            title: params.title,
            url: params.url,
            dialogClass: 'projectNotesDialog',
            loadCallBack: _updatAddNoteTypeModalCallBack,
            height: $(window).height() * params.height,
            width: $(window).width() * params.width
        }
        myAppNote.initModal(customParams);
        myAppNote.openModal();
    }
    var _updatAddNoteTypeModalCallBack = function () {      
        $.validator.unobtrusive.parse($(myAppNote.properties.appModal));
        myAppNote.uiControls();
    }
    $("#updateProjectNoteGroup").change(function (ev) {      
       _filterProjectNotesTable();       
    })
    $("#updateProjectNoteSubject").change(function (ev) {    
        _filterProjectNotesTable();       
    })
    var _saveProjectNote = function () {        
        var noteIsBlank = true;
        //validate that note is not blank - new project
        if ($('#MyProjectModel_Note_Notes').val() != "") {
            noteIsBlank = false;
        }
        if (noteIsBlank) {
            myAppNote.showModalMsg($('#projectNotesDialog'), "Please enter a note before saving.", {
                msgType: 'error', autoClose: false, centerX: true, timeOut: 1000
            });
            return false;
        }
        return true;
    }
    var _deleteMyNote = function (index) {
        $('#projectNotesDeleteDialog #btnDeleteProjectNoteCancel').off().on('click', function () {
            //close modal on cancel btn
            $('#projectNotesDeleteDialog').dialog('close');
        });
        $('#projectNotesDeleteDialog #btnDeleteProjectNoteConfirmed').off().on('click', function () {
            //close the modal and show the modal message
            $('#projectNotesDeleteDialog').dialog('close');
            var trId = "trProjectNote_" + index;
            $("#" + trId).find("td:first input:first").val('true')
            $("#" + trId).hide();
            myAppNote.showModalMsg($('#projectNotesDialog'), 'Note removed from project!', { msgType: 'success', css: { width: '80%' }, autoClose: true, centerX: true, timeOut: 2000 });
        });
    }
    var _searchNote = function (e) {
        //search for TIP or WBS number
        var copyWBSValue = $("#copyNoteWBS").val();
        if (copyWBSValue == null | copyWBSValue == "") {
            myAppNote.showModalMsg($('#projectNotesCopyDialog'), "Please enter a WBS number.", {
                msgType: 'error', autoClose: false, centerX: true, timeOut: 1000
            });
        }
        else if (copyWBSValue == "1") { //success, hard-coded to 1 for now
            $("#btnSearchBeforeCopyProjectNote").addClass("hideContent");
            $("#btnCopyConfirmedProjectNote").removeClass("hideContent");
            //once succeeded, disable input
            $("#copyNoteWBS").prop('disabled', true);
            return;
        }
        else {
            myApp.showModalMsg($('#projectNotesCopyDialog'), "Unable to find project.", {
                msgType: 'error', autoClose: false, centerX: true, timeOut: 1000
            });
        }
    }
    var _copyProjectNote = function () {
        //launch copy note modal - TIP or WBS input and a "Search" button
        var projectNotesCopyDialog = $("#projectNotesCopyDialog").dialog({
            autoOpen: false,
            closeOnEscape: false,
            modal: true,
            resizable: false,
            draggable: true,
            height: $(window).height() * .5,
            width: $(window).width() * .3,
            fluid: true,
            resizable: false
        });
        //reset button classes and set inputs to blank, enabled
        $("#btnSearchBeforeCopyProjectNote").removeClass("hideContent");
        $("#btnCopyConfirmedProjectNote").addClass("hideContent");
        $("#copyNoteWBS").val('');
        $("#copyNoteWBS").prop('disabled', false);
        projectNotesCopyDialog.dialog("open");
        $("#copyNoteWBS").keypress(function (e) {
            if (e.which == 13) {
                projectNotes.searchNote();
            }
        })
    }
    var _confirmCopyNote = function () {
        $("#projectNotesCopyDialog").dialog("close");
        myAppNote.showModalMsg($('#projectNotesDialogViewOnly'), 'Note Copied!', {
            msgType: 'success', autoClose: false, centerX: true, timeOut: 600
        });
    }
    var _addNewProjectNote = function () {        
        //Hide delete button if this is a new note (needs to be saved at least once before it can be deleted)
        $("#btnDeleteProjectNote").addClass("hideContent");
    }
    var _filterProjectNotesTable = function () {       
        //get selected dropdown values
        var selectedGroup = $("#updateProjectNoteGroup option:selected").text();
        var selectedSubject = $("#updateProjectNoteSubject option:selected").text();
        var noteTextQuery = $("#my-projectNotes-SearchNote").val().toLowerCase();
        //display all rows (remove hide class)
        $("#ProjectNotesBoby").find("tr").each(function (i) {
            if( $(this).find("td:first input:first").val() !=='true') //($(this).css('display') !== "none")
            {
                $(this).removeClass("hideContent")
                $(this).removeClass("oddNoteRow")
            }
        });
        //exit if both dropdowns set to "all" and no search terms in textbox
        if (selectedGroup == "Show All  Groups" && selectedSubject == "Show All Subjects" && !noteTextQuery) {
            _applyZebraStripeClasses();
            return false;
        }
        if (selectedGroup !== "Show All  Groups") {
            //filter groups
            $(".my-projectNotes-group").each(function () {
                if (this.innerText.trim() !== selectedGroup) {
                    $(this).parents("tr").addClass("hideContent")
                }
            })
        }
        if (selectedSubject !== "Show All Subjects") {
            //filter subjects
            $(".my-projectNotes-subject").each(function () {
                if (this.innerText.trim() !== selectedSubject) {
                    $(this).parents("tr").addClass("hideContent")
                }
            })
        }
        if (noteTextQuery) {
            $(".editProjectNote a").each(function () {
                //checks if this text is found via indexof !== 0, see https://www.joezimjs.com/javascript/great-mystery-of-the-tilde/
                if (!~((this.innerText.toLowerCase()).indexOf(noteTextQuery))) {
                    $(this).parents("tr").addClass("hideContent")
                }
            })
        }
        //applies odd note row class to get zebra-striping effect working on project notes table after filtering rows
        _applyZebraStripeClasses();
    }
    var _applyZebraStripeClasses = function () {
        $("tr").removeClass("oddNoteRow")
        $(".my-projectNotes-row:not('.hideContent'):odd").addClass("oddNoteRow");
    }
    var _editProjectNote = function () {
        //_addProjectNote();
        $("#projectNotesDialog").dialog({ title: "Edit Note" });
    }
    return {
        saveProjectNote: _saveProjectNote,
        copyProjectNote: _copyProjectNote,
        searchNote: _searchNote,
        confirmCopyNote: _confirmCopyNote,
        addNewProjectNote: _addNewProjectNote,
        filterProjectNotesTable: _filterProjectNotesTable,
        applyZebraStripeClasses: _applyZebraStripeClasses,
        editProjectNote: _editProjectNote,
        addNoteTypeModal: _addNoteTypeModal,
        deleteMyNote: _deleteMyNote
    }
})();