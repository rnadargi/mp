function saveUser(){
	var sessionData = {}, userData = {}, selRole, roleId;

	sessionData = sessionStorage.getItem('UserData');
	userData = $.parseJSON(sessionData);

	requestData = {};
	//token = b();
	//document.cookie = 'CSRF-TOKEN=' + token;
	//requestData.username = $('#registerusername').val();
	requestData.password= $('#password').val();
	requestData.firstName= $('#first_name').val();
	requestData.lastName= $('#last_name').val();
	requestData.emailId= $('#email').val();
	requestData.userCode= $('#user_code').val();
	//requestData.departmentId = userData.departmentId;
	//requestData.isCreateUser = true;
	//requestData.companyId = '1';
	requestData.companyId = userData.organizationId;

	selRole = $('#usersList').find('ul li.active > span').text();
	$('#userRoleList').find('option').each(function(){
		if($(this).text() == selRole){
			roleId = $(this).attr('data-roleId');
			requestData.role = roleId;
		}
	});

	if(roleId == 6){
		$('#deptAccordianList').find('li').each(function(){
			$(this).find('input').each(function(){
				if($(this).prop('checked')){
					requestData.departmentId = $(this).attr('data-subDeptId');
				}
			})
		});
	}else if(roleId){
		$('#mainDepartments').find('input').each(function(){
			if($(this).prop('checked')){
				requestData.departmentId = $(this).parent().attr('data-departmentId');
			}
		});
	}

	//requestData.token= 'test';
	if(validateUser(requestData)){
		$.ajax({
			  type: "POST",
			  url: location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '') + "/rest/api/surveksan/companies/1/registerUsers",
			  data: JSON.stringify(requestData),
			  Accept: 'application/json',
			  contentType: 'application/json',
			  async: false,
			  cache: false,
			  beforeSend: function (request) {
				  ajaxIndicatorStart();
		          //request.setRequestHeader("X-CSRF-TOKEN", token);
		      },
			  success: function(data){
		      	 ajaxIndicatorStop();
				 $('#saveUserModal').show();
				 setTimeout(function(){
				 $("#saveUserModal").hide();
				 $('#li_user_list').click();
				 }, 2000);
			  },
			  error: function(){
				  ajaxIndicatorStop();
			  }
        });
	}
}

function generateUserCode(){
	$('#last_name').blur(function(){
		var fname = $('#first_name').val().substring(0,3).toLowerCase(),
			lname = $(this).val().substring(0,3).toLowerCase();
		$('#user_code').val(fname + lname);
		$('#user_code').focus();
		$('#password').focus();
	});
}

function getUsers(){
	var companyId = 3;

	$.ajax({
		type: "GET",
		url: location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '') + "/rest/api/surveksan/companies/"+ companyId +"/roles",
		contentType: 'application/json',
		beforeSend: function() {
			ajaxIndicatorStart();
			//request.setRequestHeader("X-CSRF-TOKEN", token);
		},
		success: function(data){
			//alert(1);
			//console.log(data.result.roleResponse);
			$('#userRoleList').material_select();
			$("#userRoleList").empty().html(' ');
			$('#userRoleList').append($('<option disabled selected value="">Select the role</option>'));

			$.each(data.result.roleResponse, function(index, value){
				$('#userRoleList').append($('<option></option>')
					.attr('data-roleId', value.roleId)
					.text(value.roleNm));
			});

			$("#userRoleList").material_select('update');
			//$("#userRoleList").closest('#usersList').children('span.caret').remove();


			ajaxIndicatorStop();
		},
		error: function(){
			ajaxIndicatorStop();
		}
	});
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

            $.each(data.result.departmentResponse, function(index, value){
            	var inputField = '<div class="input-field col s12"' +
									'data-departmentId="' + value.departmentId + '"' +
									'data-departmentFunction="' + value.departmentFunction + '"' +
									'data-departmentAdmin="'+ value.departmentAdmin + '"' +
									'data-organizationId="'+ value.organizationId + '"' +
									'data-parentDepartmentId="'+ value.parentDepartmentId + '"' +
									'data-departmentAdminUserId="'+ value.departmentAdminUserId + '"' +
									'data-departmentCode="'+ value.departmentCode  + '">' +
								 '<input name="deptGrp" type="checkbox" id="'+ value.departmentId +'"/>' +
								 '<label for="'+ value.departmentId +'">'+ value.departmentName +'</label></div>';

				var accordianHeading = '<li class data-departmentId="' + value.departmentId + '"><div class="collapsible-header">'+ value.departmentName +'</div><div class="collapsible-body col s12" style="padding-bottom: 25px;">';

				$.each(value.subdepartments, function(index, data){
					var accordianBody = '<div class="col m12"><div class="col m1">&nbsp;</div><div class="col m11"><input name="grp" type="radio" data-subDeptId="'+ data.departmentId +'" id="'+ data.departmentId +'"/><label for="'+ data.departmentId +'">'+ data.departmentName +'</label></div></div>';
					accordianHeading = accordianHeading + accordianBody;

				});

				accordianHeading = accordianHeading + '</div></li>';

				$('#mainDepartments').append(inputField);
				if(value.subdepartments.length > 0){
					$('#deptAccordianList').append(accordianHeading);
				}

				$('#deptAccordianList').collapsible();
            });

            ajaxIndicatorStop();
        },
        error: function () {
            ajaxIndicatorStop();
        }
    });
}

function validateUser(requestData){
	if(!requestData || (requestData.firstName == '' ||
		requestData.lastName == '' || requestData.emailId == '' ||
		requestData.companyId == '' || requestData.departmentId == '' ||
		requestData.password == '' || requestData.role == '' ||
		requestData.userCode == '')){

		return false;
	}else{
		return true;
	}

}

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    $("#password").next("label").html("");
    $("#password").val(retVal);
}

$(function () {
    //var selRole = $('#usersList ul li.active > span').text();
	generateUserCode();
    getDepartment();
	getUsers();

    $('body').on('click', '#usersList ul li', function(){
        var temp = $(this).find('span').text().toLowerCase();
		//console.log(temp);

        if(temp == 'facility_admin'){
			$('#deptDiv').hide();
            $('#departmentList').show();
        }else{
			$('#deptDiv').show();
			$('#departmentList').hide();
		}

    });

	$('body').on('click', '#createUserBtn', function(){
		saveUser();
	});
	bindFunctionsWithItsId();
});

