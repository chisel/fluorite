module.exports = {
  padlockSvg: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
  	 width="401.998px" height="401.998px" viewBox="0 0 401.998 401.998" style="enable-background:new 0 0 401.998 401.998;"
  	 xml:space="preserve">
  	 <path d="M357.45,190.721c-5.331-5.33-11.8-7.993-19.417-7.993h-9.131v-54.821c0-35.022-12.559-65.093-37.685-90.218
   		C266.093,12.563,236.025,0,200.998,0c-35.026,0-65.1,12.563-90.222,37.688C85.65,62.814,73.091,92.884,73.091,127.907v54.821
   		h-9.135c-7.611,0-14.084,2.663-19.414,7.993c-5.33,5.326-7.994,11.799-7.994,19.417V374.59c0,7.611,2.665,14.086,7.994,19.417
   		c5.33,5.325,11.803,7.991,19.414,7.991H338.04c7.617,0,14.085-2.663,19.417-7.991c5.325-5.331,7.994-11.806,7.994-19.417V210.135
   		C365.455,202.523,362.782,196.051,357.45,190.721z M274.087,182.728H127.909v-54.821c0-20.175,7.139-37.402,21.414-51.675
   		c14.277-14.275,31.501-21.411,51.678-21.411c20.179,0,37.399,7.135,51.677,21.411c14.271,14.272,21.409,31.5,21.409,51.675V182.728
   		z"/>
  </svg>`,
  padlockUnlockedSvg: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
  	 width="438.533px" height="438.533px" viewBox="0 0 438.533 438.533" style="enable-background:new 0 0 438.533 438.533;"
  	 xml:space="preserve">
  	 <path d="M375.721,227.259c-5.331-5.331-11.8-7.992-19.417-7.992H146.176v-91.36c0-20.179,7.139-37.402,21.415-51.678
   		c14.277-14.273,31.501-21.411,51.678-21.411c20.175,0,37.402,7.137,51.673,21.411c14.277,14.276,21.416,31.5,21.416,51.678
   		c0,4.947,1.807,9.229,5.42,12.845c3.621,3.617,7.905,5.426,12.847,5.426h18.281c4.945,0,9.227-1.809,12.848-5.426
   		c3.606-3.616,5.42-7.898,5.42-12.845c0-35.216-12.515-65.331-37.541-90.362C284.603,12.513,254.48,0,219.269,0
   		c-35.214,0-65.334,12.513-90.366,37.544c-25.028,25.028-37.542,55.146-37.542,90.362v91.36h-9.135
   		c-7.611,0-14.084,2.667-19.414,7.992c-5.33,5.325-7.994,11.8-7.994,19.414v164.452c0,7.617,2.665,14.089,7.994,19.417
   		c5.33,5.325,11.803,7.991,19.414,7.991h274.078c7.617,0,14.092-2.666,19.417-7.991c5.325-5.328,7.994-11.8,7.994-19.417V246.673
   		C383.719,239.059,381.053,232.591,375.721,227.259z"/>
  </svg>`,
  chevronDownSvg: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
  	 width="451.847px" height="451.847px" viewBox="0 0 451.847 451.847" style="enable-background:new 0 0 451.847 451.847;"
  	 xml:space="preserve">
  	<path d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751
  		c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0
  		c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"/>
  </svg>`,
  renderTableFour: `<table class="no-header">
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Required</th>
      </tr>
    </thead>
    <tbody>
      {{#each model}}
        <tr class="model-info-row">
          <td class="model-name" align="left">{{{name}}}</td>
          <td class="model-type" align="left">{{{type}}}</td>
          <td class="model-required" align="left">{{#if required}}required{{else}}optional{{/if}}</td>
        </tr>
        <tr class="model-description-row">
          <td class="model-description" align="left" colspan="3">{{{description}}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>`,
  renderTableThree: `<table class="no-header">
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      {{#each model}}
        <tr class="model-info-row">
          <td class="model-name" align="left">{{{name}}}</td>
          <td class="model-type" align="left">{{{type}}}</td>
        </tr>
        <tr class="model-description-row">
          <td class="model-description" align="left" colspan="2">{{{description}}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>`,
  renderTableTwo: `<table class="no-header">
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      {{#each model}}
        <tr class="model-info-row">
          <td class="model-name" align="left">{{{name}}}</td>
        </tr>
        <tr class="model-description-row">
          <td class="model-description" align="left">{{{description}}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>`,
  renderTableKeyValuePair: `<table class="no-header">
    <thead>
      <tr>
        <th>Name</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {{#each value}}
        <tr>
          <td class="model-name" align="left">{{@key}}</td>
          <td class="model-value" align="left">{{this}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>`
};
