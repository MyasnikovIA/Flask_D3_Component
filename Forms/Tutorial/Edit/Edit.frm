
<div cmptype="Form" class="Main ActiveDashBoard box-sizing-force" name="MAINFORM" title="Тестовое окно" >
    <!--
        openD3Form('Tutorial/Edit/Edit')
        D3Api.showForm('Tutorial/Edit/Edit', $(".D3MainContainer").get(0), {history: false});
    -->
        <cmpEdit name="FILTER_CONTACT" datafield="PHONE" width="100%"
                    regularMask="^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$"
                    originalMask="+7(999)999-99-99"
                    templateMask="+7(999)999-99-99"
        />
    <cmpMask controls="FILTER_CONTACT" />
</div>



