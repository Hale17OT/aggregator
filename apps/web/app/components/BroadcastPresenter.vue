<script setup lang="ts">
defineProps<{person:'ada'|'eli';mouth:'closed'|'open'|'wide';active:boolean}>();
</script>
<template>
  <svg viewBox="0 0 280 330" class="broadcast-presenter" :data-presenter="person" :data-mouth="mouth" :data-active="active" role="img" :aria-label="`${person==='ada'?'Ada':'Eli'}, original animated synthetic presenter${active?', speaking':', listening'}`">
    <title>{{ person==='ada'?'Ada':'Eli' }} · original synthetic presenter</title>
    <template v-if="person==='ada'">
      <path d="M87 167C55 143 71 73 82 46C98 9 170 5 196 42C216 72 216 137 190 175Z" fill="#282622"/>
      <path d="M41 322L51 231Q58 200 106 186L175 186Q219 199 230 231L242 322" fill="#b35f3f"/>
      <path d="M106 174L106 197Q138 219 174 197L172 169" fill="#b9764e"/>
      <path d="M110 192L140 211L173 192L188 322H93Z" fill="#eee2c9"/>
      <path d="M105 192L79 215L102 244L88 260L105 322M175 193L202 215L181 245L194 261L175 322" fill="none" stroke="#713d2e" stroke-width="3"/>
      <ellipse cx="139" cy="109" rx="55" ry="72" fill="#c78a60"/>
      <path d="M85 93Q91 40 140 38Q161 73 193 80L189 47Q135-3 90 39Z" fill="#282622"/>
      <path d="M96 96Q110 89 121 96M154 96Q167 89 180 97" fill="none" stroke="#443326" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="112" cy="105" rx="4" ry="5" fill="#252620"/><ellipse cx="165" cy="105" rx="4" ry="5" fill="#252620"/>
      <path d="M138 106L132 129L143 132" fill="none" stroke="#99603f" stroke-width="3" stroke-linecap="round"/>
      <path d="M88 123L85 143M188 122L191 142" stroke="#e8bc62" stroke-width="6"/>
      <ellipse v-if="mouth!=='closed'" cx="139" cy="148" :rx="mouth==='wide'?15:9" :ry="mouth==='wide'?7:10" fill="#512e2b"/><path v-else d="M125 147Q138 155 153 146" fill="none" stroke="#783d32" stroke-width="3" stroke-linecap="round"/>
      <path d="M55 291Q92 272 123 302L139 320H49M226 291Q191 272 159 302L142 320H233" fill="#c78a60"/>
    </template>
    <template v-else>
      <path d="M39 322L49 232Q59 204 106 187H174Q219 198 233 231L244 322" fill="#345d61"/>
      <path d="M111 166L108 194L140 210L172 193L170 165" fill="#9a603f"/>
      <path d="M109 190L139 207L173 190L185 322H96Z" fill="#e2dfd0"/>
      <path d="M111 190L87 209L104 244L88 260L104 322M172 190L197 209L178 244L195 260L177 322" fill="none" stroke="#234448" stroke-width="3"/>
      <ellipse cx="141" cy="107" rx="54" ry="74" fill="#ac714d"/>
      <path d="M87 93L84 66Q85 21 124 21Q170 7 194 50L194 89L179 71Q130 71 103 55Z" fill="#302d29"/>
      <path d="M96 143Q106 170 140 182Q176 171 187 143L177 149Q158 166 140 160Q119 164 104 146Z" fill="#44342a"/>
      <path d="M98 94Q110 88 123 96M154 95Q167 87 179 94" fill="none" stroke="#403126" stroke-width="4"/>
      <g fill="none" stroke="#242f2c" stroke-width="3"><rect x="94" y="96" width="35" height="22" rx="7"/><rect x="151" y="96" width="35" height="22" rx="7"/><path d="M129 102H151"/></g><circle cx="112" cy="105" r="3" fill="#252620"/><circle cx="168" cy="105" r="3" fill="#252620"/>
      <path d="M140 109L134 130L145 132" fill="none" stroke="#815033" stroke-width="3"/>
      <ellipse v-if="mouth!=='closed'" cx="140" cy="146" :rx="mouth==='wide'?14:8" :ry="mouth==='wide'?6:9" fill="#402723"/><path v-else d="M127 145Q140 151 153 144" fill="none" stroke="#583429" stroke-width="3" stroke-linecap="round"/>
      <path d="M52 290Q87 275 122 300L139 320H48M230 290Q191 275 160 301L143 320H234" fill="#ac714d"/>
    </template>
    <path d="M139 225L142 229L145 225" stroke="#212e28" stroke-width="3" fill="none"/>
  </svg>
</template>
