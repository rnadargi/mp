function saveDepartment() {
	var requestData = {}, selData, selectedDept, sessionData = {}, userData = {}, companyId,
		subDeptFlag = $('#departments').find('ul').find('li').hasClass('selected');

	sessionData = sessionStorage.getItem('UserData');
	userData = $.parseJSON(sessionData);
	companyId = 1;
	requestData.departmentName = $('#dept_name').val();
	//requestData.companyId = userData.companyId;
	requestData.companyId = '1'; // For Anonymous Users companyId = 2


	if(validateUser(requestData) && requestData.departmentName != ''){
		selectedDept = $('#departments').find('ul li.active > span').text();
		$.each($('#departments').find('select option'), function(index, value){
			if($(value).text() == selectedDept){
				selData = $(value);
			}
		});

		if(subDeptFlag && $('#sub_departments').prop('checked')){
			requestData.departmentFunction = $(selData).attr('data-departmentFunction');
			requestData.departmentAdmin = userData.userId;
			requestData.parentDepartmentId = $(selData).attr('data-parentDepartmentId');
			requestData.departmentAdminUserId = $(selData).attr('data-departmentAdminUserId');
			requestData.departmentCode = $(selData).attr('data-departmentCode');
		}else{
			requestData.departmentFunction = "default";
			requestData.departmentAdmin = userData.userId;
			requestData.parentDepartmentId = null;
			requestData.departmentAdminUserId = null;
			requestData.departmentCode = null;
		}

		$.ajax({
			type: "POST",
			url: location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '') + "/rest/api/surveksan/companies/" + companyId + "/addDepartment",
			contentType: 'application/json',
			data: JSON.stringify(requestData),
			async: true,
			cache: false,
			beforeSend: function () {
				ajaxIndicatorStart();
				//request.setRequestHeader("X-CSRF-TOKEN", token);
			},
			success: function(data) {
				if(data.success == true){
					//alert('Department Saved Successfully.');
					$('#saveDeptModal').show();
					setTimeout(function(){
						$("#saveDeptModal").hide();
						$('#li_asset_list').click();
					}, 2000);

				}
				ajaxIndicatorStop();
			},
			error: function (data) {
				alert(data);
				ajaxIndicatorStop();
			}
		});
	}
}

function validateUser(requestData){
	if(!requestData || (requestData.dept_name == '')){
		return false;
	}else{
		var subDeptFlag = $('#departments').find('ul').find('li').hasClass('selected');
		if((requestData.dept_name != '') && !$('#sub_departments').prop('checked')){
			return true;
		}
		if($('#sub_departments').prop('checked') && subDeptFlag){
			return true;
		}else{
			return false;
		}
	}

}

function getDepartment() {
	//var userData = sessionStorage.getItem('UserData'); /* */
	var companyId = 1; // companyId = userData.userId;

	$.ajax({
		type: "GET",
		url: location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '') + "/rest/api/surveksan/companies/" + companyId + "/department",
		contentType: 'application/json',
		async: true,
		cache: false,
		beforeSend: function (request) {
			ajaxIndicatorStart();
			//request.setRequestHeader("X-CSRF-TOKEN", token);
		},
		success: function (data) {
			var result = data.result.departmentResponse;
			// Initialize
			$('#selectDropdownDept').material_select();
			$("#selectDropdownDept").empty().html(' ');
			$('#selectDropdownDept').append($('<option disabled selected value="">Select the Department</option>'));

			$.each(data.result.departmentResponse, function(index, value){
				//$('#departments').find('ul').append('<li class="" data-roleId="'+ value.departmentId +'"><span>'+ value.departmentName +'</span></li>');
				$('#selectDropdownDept').append($('<option></option>')
					.attr('data-departmentId', value.departmentId)
					.attr('data-departmentFunction', value.departmentFunction)
					.attr('data-departmentAdmin', value.departmentAdmin)
					.attr('data-organizationId', value.organizationId)
					.attr('data-parentDepartmentId', value.parentDepartmentId)
					.attr('data-departmentAdminUserId', value.departmentAdminUserId)
					.attr('data-departmentCode', value.departmentCode)
					.text(value.departmentName));
			});

			// Update the content clearing the caret
			$("#selectDropdownDept").material_select('update');
			$("#selectDropdownDept").closest('#departments').children('span.caret').remove();

			ajaxIndicatorStop();
		},
		error: function () {
			ajaxIndicatorStop();
		}
	});
}

$(function () {

	getDepartment();

	$('#sub_departments').on('click', function(){
		if($(this).prop('checked')){
			$('#departments').show();
		}else{
			$('#departments').hide();
		}
	});

	$('body').one('click', '#submitOne', function () {
		saveDepartment();
	});

	$('body').on('click', '#createDepartmentBtn', function () {
		$('#submitOne').trigger('click');
	});

});


